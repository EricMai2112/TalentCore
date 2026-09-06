import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from '../schemas/application.schema';
import { AiEvaluation, AiEvaluationDocument } from '../schemas/ai-evaluation.schema';
import { Candidate, CandidateDocument } from 'src/modules/candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionDocument } from 'src/modules/job-description/schemas/job-description.schema';
import { PipelineTemplate, PipelineTemplateDocument } from 'src/modules/pipeline-template/schemas/pipeline-template.schema';
import { AiMatchingService } from '../services/ai-matching.service';

@Injectable()
export class AiMatchingProcessor {
  private readonly logger = new Logger(AiMatchingProcessor.name);

  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(AiEvaluation.name) private aiEvaluationModel: Model<AiEvaluationDocument>,
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(JobDescription.name) private jobModel: Model<JobDescriptionDocument>,
    @InjectModel(PipelineTemplate.name) private pipelineModel: Model<PipelineTemplateDocument>,
    private readonly aiMatchingService: AiMatchingService,
  ) {}

  async processMatching(
    applicationId: string,
    options?: { isFromBullMQ?: boolean; jobId?: string; attempt?: number },
  ) {
    const isFromBullMQ = options?.isFromBullMQ ?? false;
    const jobId = options?.jobId ?? 'IN_PROCESS';
    const attempt = options?.attempt ?? 1;

    this.logger.log(
      `[AI Matching Processor] Bắt đầu đánh giá cho Application: ${applicationId} (Job: ${jobId}, Attempt: ${attempt})`,
    );

    let job: any = null;

    try {
      const application = await this.applicationModel.findById(applicationId);
      if (!application) {
        this.logger.warn(`[AI Matching] Không tìm thấy Application ${applicationId}`);
        return;
      }

      const [candidate, foundJob] = await Promise.all([
        this.candidateModel.findById(application.candidateId),
        this.jobModel.findById(application.jobDescriptionId),
      ]);
      job = foundJob;

      if (!candidate || !job || !job.criteria?.length) {
        this.logger.warn(
          `[AI Matching] Không đủ dữ liệu criteria để thực hiện AI Matching cho Application: ${applicationId} (JobId: ${job?._id || 'N/A'})`,
        );
        return;
      }

      // 1. Trích xuất toàn văn hồ sơ ứng viên thành văn bản chuẩn hóa
      const fullCvText = this.aiMatchingService.buildFullCvText(candidate);

      // 2. Chấm điểm qua Gemini LLM (đã tích hợp tự động retry với exponential backoff & jitter)
      const aiResult = await this.aiMatchingService.evaluateCriteriaWithAi(
        fullCvText,
        job.title,
        job.experienceLevel,
        job.criteria,
      );

      // 3. Backend validate bằng chứng & tính điểm tất định theo rubric 6 mức
      const finalEvaluation = this.aiMatchingService.processDeterministicScoring(
        fullCvText,
        job.criteria,
        aiResult,
      );

      // 4. Lưu kết quả vào Collection AiEvaluation (Idempotent: Upsert dựa trên applicationId duy nhất)
      await this.aiEvaluationModel.findOneAndUpdate(
        { applicationId: application._id },
        { ...finalEvaluation, applicationId: application._id },
        { upsert: true, returnDocument: 'after' },
      );

      // 5. Tự động chuyển Application sang Stage tiếp theo trong Pipeline
      const pipeline = await this.pipelineModel.findById(job.pipelineTemplateId);
      if (pipeline?.stages?.length) {
        const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order);
        const currentIndex = sortedStages.findIndex(
          (s) => s._id.toString() === application.currentStageId.toString(),
        );

        // Nếu đang ở Stage đầu tiên, tự động chuyển sang Stage thứ 2
        if (currentIndex === 0 && sortedStages.length > 1) {
          const nextStage = sortedStages[1];
          application.currentStageId = nextStage._id;
          await application.save();
          this.logger.log(
            `[AI Matching] Hoàn thành! Tự động chuyển Application ${applicationId} sang Stage: ${nextStage.name}`,
          );
        }
      }
    } catch (error: any) {
      // Bóc tách thông tin lỗi an toàn (không log API key hoặc dữ liệu nhạy cảm)
      const status = error?.status || error?.code || error?.error?.code || 'UNKNOWN';
      const rawMessage = error?.message || error?.error?.message || String(error);
      const safeMessage = rawMessage.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=***');

      this.logger.error(
        `[AI Matching Processor] Lỗi xử lý Application ${applicationId} (Job: ${jobId}, Attempt: ${attempt}) [${status}]: ${safeMessage}`,
      );

      // Nếu chạy qua BullMQ Worker, re-throw lỗi để BullMQ kích hoạt cơ chế retry của Job
      if (isFromBullMQ) {
        throw error;
      }

      // Nếu chạy trực tiếp ở chế độ nền (setImmediate), bắt lỗi tại đây để TUYỆT ĐỐI KHÔNG làm crash tiến trình Node.js
    }
  }
}