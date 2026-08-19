import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from '../schemas/application.schema';
import { Candidate, CandidateDocument } from 'src/modules/candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionDocument, JobStatus } from 'src/modules/job-description/schemas/job-description.schema';
import { PipelineTemplate, PipelineTemplateDocument } from 'src/modules/pipeline-template/schemas/pipeline-template.schema';

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
}