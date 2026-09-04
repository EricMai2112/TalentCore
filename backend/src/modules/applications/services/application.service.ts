import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from '../schemas/application.schema';
import { Candidate, CandidateDocument } from 'src/modules/candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionDocument, JobStatus } from 'src/modules/job-description/schemas/job-description.schema';
import { PipelineTemplate, PipelineTemplateDocument } from 'src/modules/pipeline-template/schemas/pipeline-template.schema';
import { AiMatchingProcessor } from '../processors/ai-matching.processor';
import { AiEvaluation, AiEvaluationDocument } from '../schemas/ai-evaluation.schema';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,

    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,

    @InjectModel(JobDescription.name)
    private readonly jobModel: Model<JobDescriptionDocument>,

    @InjectModel(PipelineTemplate.name)
    private readonly pipelineModel: Model<PipelineTemplateDocument>,

    @InjectModel(AiEvaluation.name)
    private readonly aiEvaluationModel: Model<AiEvaluationDocument>,

    private readonly aiMatchingProcessor: AiMatchingProcessor
  ) {}

  async applyJob(userId: string, jobDescriptionId: string, candidateId: string) {
    const userObjId = new Types.ObjectId(userId);

    const candidate = await this.candidateModel.findOne({
      _id: new Types.ObjectId(candidateId),
      userId: userObjId,
    });
    if (!candidate) {
      throw new BadRequestException('Hồ sơ không tồn tại hoặc không thuộc về bạn.');
    }

    const job = await this.jobModel.findById(jobDescriptionId);
    if (!job || job.status !== JobStatus.JD_CREATED) {
      throw new NotFoundException('Tin tuyển dụng không tồn tại hoặc đã đóng.');
    }

    const userProfiles = await this.candidateModel
      .find({ userId: userObjId }, { _id: 1 })
      .exec();
    const userCandidateIds = userProfiles.map((p) => p._id);

    const existingApp = await this.applicationModel.findOne({
      candidateId: { $in: userCandidateIds },
      jobDescriptionId: new Types.ObjectId(jobDescriptionId),
    });

    if (existingApp) {
      throw new BadRequestException('Bạn đã ứng tuyển vào vị trí này rồi!');
    }

    const pipeline = await this.pipelineModel.findById(job.pipelineTemplateId);
    if (!pipeline || !pipeline.stages || pipeline.stages.length === 0) {
      throw new BadRequestException('Quy trình tuyển dụng của vị trí này chưa được thiết lập.');
    }

    const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order);
    const initialStage = sortedStages[0];

    const newApplication = await this.applicationModel.create({
      candidateId: candidate._id,
      jobDescriptionId: new Types.ObjectId(jobDescriptionId),
      currentStageId: initialStage._id,
      appliedAt: new Date(),
    });

    setImmediate(() => {
      this.aiMatchingProcessor.processMatching(newApplication._id.toString());
    });

    return {
      message: 'Ứng tuyển thành công!',
      applicationId: newApplication._id,
      currentStage: {
        _id: initialStage._id,
        name: initialStage.name,
        color: initialStage.color,
      },
    };
  }

  async getKanbanApplications(params: { departmentId?: string; jobId?: string; search?: string }) {
    const query: any = {};

    if (params.jobId && Types.ObjectId.isValid(params.jobId)) {
      query.jobDescriptionId = new Types.ObjectId(params.jobId);
    }

    const applications = await this.applicationModel
      .find(query)
      .populate({
        path: 'jobDescriptionId',
        populate: [
          { path: 'departmentId' },
          { path: 'pipelineTemplateId' },
          { path: 'requiredSkills' },
          { path: 'interviewerIds', select: 'name email role' },
          { path: 'interviewerId', select: 'name email role' },
        ],
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .sort({ appliedAt: -1 })
      .lean()
      .exec();

    // Lấy thông tin AI Evaluation gắn vào từng Application
    const appIds = applications.map((app) => app._id);
    const evaluations = await this.aiEvaluationModel
      .find({ applicationId: { $in: appIds } })
      .lean()
      .exec();

    const evalMap = new Map<string, any>();
    evaluations.forEach((item) => {
      evalMap.set(item.applicationId.toString(), item);
    });

    let filtered = applications.map((app: any) => {
      const aiEval = evalMap.get(app._id.toString());
      const job = app.jobDescriptionId as any;
      const pipeline = job?.pipelineTemplateId;
      const currentStage = pipeline?.stages?.find(
        (s: any) => s._id?.toString() === app.currentStageId?.toString(),
      );

      return {
        ...app,
        stageName: currentStage?.name || 'Mới',
        stageColor: currentStage?.color || '#94a3b8',
        currentStage: currentStage || null,
        aiFitScore: aiEval?.aiFitScore ?? app?.aiFitScore ?? null,
        evidenceStrengthScore: aiEval?.evidenceStrengthScore ?? 0,
        isMissingMandatory: Boolean(aiEval?.isMissingMandatory),
        aiEvaluation: aiEval || null,
      };
    });

    if (params.departmentId) {
      filtered = filtered.filter((app) => {
        const job = app.jobDescriptionId as any;
        const deptId =
          typeof job?.departmentId === 'object'
            ? job?.departmentId?._id?.toString()
            : job?.departmentId?.toString();
        return deptId === params.departmentId;
      });
    }

    if (params.jobId) {
      filtered = filtered.filter((app) => {
        const job = app.jobDescriptionId as any;
        const jId =
          typeof job === 'object'
            ? job?._id?.toString()
            : app.jobDescriptionId?.toString();
        return jId === params.jobId;
      });
    }

    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      filtered = filtered.filter((app) => {
        const candidate = app.candidateId as any;
        const user = candidate?.userId as any;
        const name = user?.name || candidate?.fullName || candidate?.profileName || '';
        const job = app.jobDescriptionId as any;
        const jobTitle = job?.title || '';
        return name.toLowerCase().includes(term) || jobTitle.toLowerCase().includes(term);
      });
    }

    // Sắp xếp theo thứ tự ưu tiên:
    // 1. Điểm chính aiFitScore từ cao xuống thấp (hồ sơ chưa chấm xếp sau)
    // 2. Nếu điểm bằng nhau -> xét tới điểm độ mạnh bằng chứng (evidenceStrengthScore từ cao xuống thấp)
    // 3. Nếu bằng nhau tiếp -> xét theo thời gian ứng tuyển (appliedAt mới nhất trước)
    filtered.sort((a: any, b: any) => {
      const scoreA = a.aiFitScore !== null && a.aiFitScore !== undefined ? a.aiFitScore : -1;
      const scoreB = b.aiFitScore !== null && b.aiFitScore !== undefined ? b.aiFitScore : -1;

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      const evidenceA = a.evidenceStrengthScore ?? a.aiEvaluation?.evidenceStrengthScore ?? 0;
      const evidenceB = b.evidenceStrengthScore ?? b.aiEvaluation?.evidenceStrengthScore ?? 0;

      if (evidenceB !== evidenceA) {
        return evidenceB - evidenceA;
      }

      const timeA = new Date(a.appliedAt || 0).getTime();
      const timeB = new Date(b.appliedAt || 0).getTime();
      return timeB - timeA;
    });

    return filtered;
  }

  async updateApplicationStage(applicationId: string, stageId: string) {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestException('ID đơn ứng tuyển không hợp lệ');
    }

    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    application.currentStageId = stageId as any;
    const updated = await application.save();

    return this.getApplicationById(updated._id.toString());
  }

  async getApplicationById(applicationId: string) {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate({
        path: 'jobDescriptionId',
        populate: { path: 'pipelineTemplateId' },
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email phone avatar' },
      });

    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển.');
    }

    const job = application.jobDescriptionId as any;
    const pipeline = job?.pipelineTemplateId;

    const currentStage = pipeline?.stages?.find(
      (s: any) => s._id.toString() === application.currentStageId.toString(),
    );

    return {
      ...application.toObject(),
      stageName: currentStage?.name || 'Không xác định',
      stageColor: currentStage?.color || '#94a3b8',
      currentStage,
    };
  }

  async addNote(
    applicationId: string,
    dto: { authorName: string; authorRole: string; content: string },
  ) {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestException('ID đơn ứng tuyển không hợp lệ');
    }

    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    const newNote = {
      authorName: dto.authorName,
      authorRole: dto.authorRole,
      content: dto.content,
      createdAt: new Date(),
    };

    if (!application.notes) {
      application.notes = [];
    }

    application.notes.push(newNote as any);
    await application.save();

    return this.getApplicationById(applicationId);
  }

  async deleteApplication(applicationId: string) {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestException('ID đơn ứng tuyển không hợp lệ');
    }
    await this.applicationModel.findByIdAndDelete(applicationId);
    return { success: true };
  }

  async getApplicationsByUserId(userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const candidateProfiles = await this.candidateModel
      .find({ userId: userObjId }, { _id: 1 })
      .exec();

    const candidateIds = candidateProfiles.map((p) => p._id);

    const applications = await this.applicationModel
      .find({ candidateId: { $in: candidateIds } })
      .populate({
        path: 'jobDescriptionId',
        populate: [
          { path: 'departmentId' },
          { path: 'pipelineTemplateId' },
        ],
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .sort({ appliedAt: -1 })
      .lean()
      .exec();

    const appIds = applications.map((app) => app._id);
    const evaluations = await this.aiEvaluationModel
      .find({ applicationId: { $in: appIds } })
      .lean()
      .exec();

    const evalMap = new Map<string, any>();
    evaluations.forEach((item) => {
      evalMap.set(item.applicationId.toString(), item);
    });

    const mappedApps = applications.map((app: any) => {
      const aiEval = evalMap.get(app._id.toString());
      const job = app.jobDescriptionId as any;
      const pipeline = job?.pipelineTemplateId;

      const rawStages = pipeline?.stages
        ? [...pipeline.stages].sort((a: any, b: any) => a.order - b.order)
        : [];

      const currentStageIndex = rawStages.findIndex(
        (s: any) => s._id?.toString() === app.currentStageId?.toString(),
      );

      const currentStage =
        currentStageIndex >= 0 ? rawStages[currentStageIndex] : null;

      return {
        ...app,
        stageName: currentStage?.name || 'Mới ứng tuyển',
        stageColor: currentStage?.color || '#4f46e5',
        currentStage,
        currentStageIndex: currentStageIndex >= 0 ? currentStageIndex : 0,
        stages: rawStages,
        aiFitScore: aiEval?.aiFitScore ?? app?.aiFitScore ?? null,
        aiEvaluation: aiEval || null,
      };
    });

    const totalApplied = mappedApps.length;
    let processingCount = 0;
    let interviewCount = 0;
    let offerCount = 0;

    mappedApps.forEach((app) => {
      const sName = (app.stageName || '').toLowerCase();
      if (sName.includes('offer')) {
        offerCount++;
      } else if (
        sName.includes('phỏng vấn') ||
        sName.includes('interview') ||
        sName.includes('tech') ||
        sName.includes('phone') ||
        sName.includes('culture')
      ) {
        interviewCount++;
        processingCount++;
      } else {
        processingCount++;
      }
    });

    return {
      applications: mappedApps,
      stats: {
        totalApplied,
        processingCount,
        interviewCount,
        offerCount,
      },
    };
  }
}