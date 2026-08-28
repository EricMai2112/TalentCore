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

  async processMatching(applicationId: string) {
    this.logger.log(`[AI Matching Queue] Bắt đầu đánh giá cho Application: ${applicationId}`);

    const application = await this.applicationModel.findById(applicationId);
    if (!application) return;

    const [candidate, job] = await Promise.all([
      this.candidateModel.findById(application.candidateId),
      this.jobModel.findById(application.jobDescriptionId),
    ]);

    if (!candidate || !job || !job.criteria?.length) {
      this.logger.warn(`Không đủ dữ liệu criteria để thực hiện AI Matching cho Application: ${applicationId}`);
      return;
    }

    try {
      // 1. Trích xuất toàn văn hồ sơ
      const fullCvText = this.aiMatchingService.buildFullCvText(candidate);

      // 2. Chấm điểm qua LLM với Temperature = 0
      const aiResult = await this.aiMatchingService.evaluateCriteriaWithAi(
        fullCvText,
        job.title,
        job.experienceLevel,
        job.criteria,
      );

      // 3. Backend validate & tính điểm tất định
      const finalEvaluation = this.aiMatchingService.processDeterministicScoring(
        fullCvText,
        job.criteria,
        aiResult,
      );

      // 4. Lưu kết quả vào Collection AiEvaluation
      await this.aiEvaluationModel.findOneAndUpdate(
        { applicationId: application._id },
        { ...finalEvaluation, applicationId: application._id },
        { upsert: true, returnDocument: 'after' },
      );

      // 5. Tự động nhảy qua Stage kế tiếp trong Pipeline
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
          this.logger.log(`[AI Matching] Hoàn thành! Tự động chuyển Application sang Stage: ${nextStage.name}`);
        }
      }
    } catch (error: any) {
      this.logger.error(`Lỗi xử lý AI Matching cho Application ${applicationId}:`, error);
      throw error; // Kích hoạt retry của BullMQ nếu cấu hình
    }
  }
}