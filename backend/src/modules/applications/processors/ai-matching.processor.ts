import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from '../schemas/application.schema';
import { AiEvaluation, AiEvaluationDocument } from '../schemas/ai-evaluation.schema';
import { Candidate, CandidateDocument } from 'src/modules/candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionDocument } from 'src/modules/job-description/schemas/job-description.schema';
import { PipelineTemplate, PipelineTemplateDocument } from 'src/modules/pipeline-template/schemas/pipeline-template.schema';
import { AiMatchingService } from '../services/ai-matching.service';
import { AwsObservabilityService } from '../services/aws-observability.service';

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
    @Optional() private readonly awsObservabilityService?: AwsObservabilityService,
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
    const matchingStartTime = Date.now();
    let normDurationMs = 0;
    let llmDurationMs = 0;
    let persistDurationMs = 0;

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

      const normStart = Date.now();
      const fullCvText =
        application.parsedCvText && application.parsedCvText.trim().length > 30
          ? application.parsedCvText
          : this.aiMatchingService.buildFullCvText(candidate);

      const skillSet = new Set<string>();
      (candidate.skills || []).forEach((s: any) => s.name && skillSet.add(s.name.trim()));
      (candidate.projects || []).forEach((p: any) =>
        (p.technologies || []).forEach((t: string) => t && skillSet.add(t.trim())),
      );
      (candidate.experiences || []).forEach((e: any) =>
        (e.technologies || []).forEach((t: string) => t && skillSet.add(t.trim())),
      );
      if (this.aiMatchingService.skillGraphService) {
        const extracted = this.aiMatchingService.skillGraphService.extractSkills(fullCvText);
        extracted.forEach((s) => {
          const node = this.aiMatchingService.skillGraphService?.getSkillNode(s);
          skillSet.add(node?.name || s);
        });
      }
      const candidateSkills = Array.from(skillSet).filter(Boolean);
      normDurationMs = Math.max(1, Date.now() - normStart);

      const llmStart = Date.now();
      const aiResult = await this.aiMatchingService.evaluateCriteriaWithAi(
        fullCvText,
        job.title,
        job.experienceLevel,
        job.criteria,
      );
      llmDurationMs = Math.max(1, Date.now() - llmStart);

      const finalEvaluation = await this.aiMatchingService.processDeterministicScoring(
        fullCvText,
        job.criteria,
        aiResult,
        candidateSkills,
      );

      const persistStart = Date.now();
      const { diagnostics, ...dbEvaluationPayload } = finalEvaluation as any;
      await this.aiEvaluationModel.findOneAndUpdate(
        { applicationId: application._id },
        { ...dbEvaluationPayload, applicationId: application._id },
        { upsert: true, returnDocument: 'after' },
      );

      const pipeline = await this.pipelineModel.findById(job.pipelineTemplateId);
      if (pipeline?.stages?.length) {
        const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order);
        const currentIndex = sortedStages.findIndex(
          (s) => s._id.toString() === application.currentStageId.toString(),
        );

        if (currentIndex === 0 && sortedStages.length > 1) {
          const nextStage = sortedStages[1];
          application.currentStageId = nextStage._id;
          await application.save();
          this.logger.log(
            `[AI Matching] Hoàn thành! Tự động chuyển Application ${applicationId} sang Stage: ${nextStage.name}`,
          );
        }
      }
      persistDurationMs = Math.max(1, Date.now() - persistStart);

      //CloudWatch
      const totalDurationMs = Date.now() - matchingStartTime;
      if (this.awsObservabilityService) {
        await this.awsObservabilityService.recordMatchingTelemetry({
          applicationId: String(application._id),
          jobId: String(job._id || jobId),
          attempt,
          timings: {
            cvNormalizationMs: normDurationMs,
            llmEvaluationMs: llmDurationMs,
            knowledgeGraphMs: diagnostics?.totalGraphDurationMs || 0,
            deterministicValidationMs: diagnostics?.totalEvidenceDurationMs || 0,
            persistenceMs: persistDurationMs,
            totalDurationMs,
          },
          criteriaCount: job.criteria.length,
          unverifiedEvidenceCount: diagnostics?.unverifiedEvidenceCount || 0,
          hallucinationRate: diagnostics?.hallucinationRate || 0,
          transferredSkillsCount: diagnostics?.transferredSkillsCount || 0,
          finalScore: finalEvaluation.aiFitScore,
          status: 'SUCCESS',
        });
      }
    } catch (error: any) {
      const status = error?.status || error?.code || error?.error?.code || 'UNKNOWN';
      const rawMessage = error?.message || error?.error?.message || String(error);
      const safeMessage = rawMessage.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=***');

      this.logger.error(
        `[AI Matching Processor] Lỗi xử lý Application ${applicationId} (Job: ${jobId}, Attempt: ${attempt}) [${status}]: ${safeMessage}`,
      );

      if (this.awsObservabilityService) {
        await this.awsObservabilityService.recordMatchingTelemetry({
          applicationId,
          jobId: String(job?._id || jobId),
          attempt,
          timings: {
            cvNormalizationMs: normDurationMs,
            llmEvaluationMs: llmDurationMs,
            knowledgeGraphMs: 0,
            deterministicValidationMs: 0,
            persistenceMs: persistDurationMs,
            totalDurationMs: Date.now() - matchingStartTime,
          },
          criteriaCount: job?.criteria?.length || 0,
          unverifiedEvidenceCount: 0,
          hallucinationRate: 0,
          transferredSkillsCount: 0,
          finalScore: 0,
          status: 'FAILED',
        });
      }

      if (isFromBullMQ) {
        throw error;
      }

    }
  }
}