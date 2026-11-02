import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from '../schemas/application.schema';
import { AiEvaluation, AiEvaluationDocument } from '../schemas/ai-evaluation.schema';
import { AiMatchingProcessor } from '../processors/ai-matching.processor';

@Injectable()
export class AiMatchingCronService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AiMatchingCronService.name);
  private initialTimeoutRef: NodeJS.Timeout | null = null;
  private intervalRef: NodeJS.Timeout | null = null;
  private isRunning = false;

  private readonly failedAttemptsMap = new Map<string, number>();

  //15 minutes per running
  private readonly INTERVAL_MS = 15 * 60 * 1000;
  //delay 60s before activating
  private readonly INITIAL_DELAY_MS = 60 * 1000;
  //limit 3 turns
  private readonly BATCH_SIZE = 3;
  // Khoảng nghỉ (Throttle Delay 2s)
  private readonly THROTTLE_DELAY_MS = 2000;
  private readonly MAX_FAILED_ATTEMPTS = 3;
  // 48 hours
  private readonly LOOKBACK_HOURS = 48;
  private readonly COOLDOWN_MINUTES = 5;

  constructor(
    @InjectModel(Application.name) private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(AiEvaluation.name) private readonly aiEvaluationModel: Model<AiEvaluationDocument>,
    private readonly aiMatchingProcessor: AiMatchingProcessor,
  ) {}

  onApplicationBootstrap() {
    this.initialTimeoutRef = setTimeout(() => {
      this.runReconciliationLoop().catch((err) => {
        this.logger.error(`[AiMatchingCronService] Lỗi chạy lần đầu: ${err?.message || err}`);
      });

      this.intervalRef = setInterval(() => {
        this.runReconciliationLoop().catch((err) => {
          this.logger.error(`[AiMatchingCronService] Lỗi chạy định kỳ: ${err?.message || err}`);
        });
      }, this.INTERVAL_MS);

      this.intervalRef.unref();
    }, this.INITIAL_DELAY_MS);

    this.initialTimeoutRef.unref();

    this.logger.log(
      `[AiMatchingCronService] Đã kích hoạt Cron Job tự động chấm bù AI (Chu kỳ: ${this.INTERVAL_MS / 60000} phút, Batch size: ${this.BATCH_SIZE})`,
    );
  }

  onApplicationShutdown() {
    if (this.initialTimeoutRef) {
      clearTimeout(this.initialTimeoutRef);
      this.initialTimeoutRef = null;
    }
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
    this.failedAttemptsMap.clear();
    this.logger.log('[AiMatchingCronService] Đã dừng Cron Job chấm bù AI an toàn.');
  }

  async runReconciliationLoop() {
    if (this.isRunning) {
      this.logger.debug('[AiMatchingCronService] Chu kỳ trước đang chạy, bỏ qua lượt này.');
      return;
    }

    this.isRunning = true;

    try {
      const now = new Date();
      const minAppliedAt = new Date(now.getTime() - this.LOOKBACK_HOURS * 60 * 60 * 1000);
      const maxAppliedAt = new Date(now.getTime() - this.COOLDOWN_MINUTES * 60 * 1000);

      const recentApps = await this.applicationModel
        .find({
          appliedAt: { $gte: minAppliedAt, $lte: maxAppliedAt },
        })
        .select('_id appliedAt')
        .sort({ appliedAt: 1 })
        .limit(50)
        .lean();

      if (!recentApps || recentApps.length === 0) {
        return;
      }

      const recentAppIds = recentApps.map((a) => a._id);

      const evaluatedDocs = await this.aiEvaluationModel
        .find({ applicationId: { $in: recentAppIds } })
        .select('applicationId')
        .lean();

      const evaluatedSet = new Set(evaluatedDocs.map((doc) => doc.applicationId.toString()));

      const pendingApps = recentApps
        .filter((app) => {
          const idStr = app._id.toString();
          if (evaluatedSet.has(idStr)) return false;

          const failCount = this.failedAttemptsMap.get(idStr) || 0;
          if (failCount >= this.MAX_FAILED_ATTEMPTS) {
            return false;
          }

          return true;
        })
        .slice(0, this.BATCH_SIZE);

        //stopping cycle and continuing sleeping 15 minutes
      if (pendingApps.length === 0) {
        return;
      }

      this.logger.log(
        `[AiMatchingCronService] Phát hiện ${pendingApps.length} hồ sơ chưa được chấm điểm AI. Bắt đầu tự động chấm bù...`,
      );

      for (const app of pendingApps) {
        const appId = app._id.toString();
        const currentFails = this.failedAttemptsMap.get(appId) || 0;

        try {
          const alreadyEvaluated = await this.aiEvaluationModel.exists({ applicationId: app._id });
          if (alreadyEvaluated) {
            this.failedAttemptsMap.delete(appId);
            continue;
          }

          this.logger.log(
            `[AiMatchingCronService] Đang chấm bù tự động cho Application ${appId} (Lần thử ${currentFails + 1}/${this.MAX_FAILED_ATTEMPTS})...`,
          );

          await this.aiMatchingProcessor.processMatching(appId, {
            jobId: 'CRON_SELF_HEALING',
            attempt: currentFails + 1,
          });

          const checkSuccess = await this.aiEvaluationModel.exists({ applicationId: app._id });
          if (checkSuccess) {
            this.failedAttemptsMap.delete(appId);
            this.logger.log(
              `[AiMatchingCronService] Chấm bù THÀNH CÔNG cho Application ${appId}.`,
            );
          } else {
            this.failedAttemptsMap.set(appId, currentFails + 1);
          }

          await new Promise((resolve) => setTimeout(resolve, this.THROTTLE_DELAY_MS));
        } catch (error: any) {
          const nextFails = currentFails + 1;
          this.failedAttemptsMap.set(appId, nextFails);

          this.logger.warn(
            `[AiMatchingCronService] Chấm bù thất bại cho Application ${appId} (${nextFails}/${this.MAX_FAILED_ATTEMPTS}): ${error?.message || error}`,
          );

          if (nextFails >= this.MAX_FAILED_ATTEMPTS) {
            this.logger.warn(
              `[AiMatchingCronService] Application ${appId} đã đạt giới hạn ${this.MAX_FAILED_ATTEMPTS} lần chấm bù thất bại. Tạm ngừng xử lý tự động cho hồ sơ này.`,
            );
          }
        }
      }
    } catch (error: any) {
      this.logger.error(
        `[AiMatchingCronService] Lỗi trong tiến trình quét tự phục hồi: ${error?.message || error}`,
      );
    } finally {
      this.isRunning = false;
    }
  }
}
