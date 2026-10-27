import { Injectable, BadRequestException, NotFoundException, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import * as fs from 'fs';
import { Application, ApplicationDocument, ApplicationStatus } from '../schemas/application.schema';
import { Candidate, CandidateDocument } from 'src/modules/candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionDocument, JobStatus } from 'src/modules/job-description/schemas/job-description.schema';
import { PipelineTemplate, PipelineTemplateDocument, StageType } from 'src/modules/pipeline-template/schemas/pipeline-template.schema';
import { AiMatchingProcessor } from '../processors/ai-matching.processor';
import { AiMatchingService } from './ai-matching.service';
import { AiEvaluation, AiEvaluationDocument } from '../schemas/ai-evaluation.schema';
import { CvParserService } from 'src/modules/candidates/services/cv-parser.service';
import {
  Interview,
  InterviewDocument,
  LocationType,
  InterviewStatus,
  InterviewResult,
  InterviewConfirmationStatus,
} from 'src/modules/interviews/schemas/interview.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { EmailService } from '../../email-template/services/email.service';
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '../../notifications/schemas/notification.schema';
import { S3StorageService } from './s3-storage.service';
import { AwsSqsService } from './aws-sqs.service';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

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

    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,

    private readonly aiMatchingProcessor: AiMatchingProcessor,
    private readonly aiMatchingService: AiMatchingService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    @Optional() private readonly cvParserService?: CvParserService,
    @Optional() private readonly s3StorageService?: S3StorageService,
    @Optional() private readonly awsSqsService?: AwsSqsService,
  ) {}

  async applyJob(
    userId: string,
    jobDescriptionId: string,
    candidateId?: string,
    file?: Express.Multer.File,
  ) {
    const userObjId = new Types.ObjectId(userId);

    const job = await this.jobModel.findById(jobDescriptionId);
    if (!job || job.status !== JobStatus.JD_CREATED) {
      throw new NotFoundException('Tin tuyển dụng không tồn tại hoặc đã đóng.');
    }

    const pipeline = await this.pipelineModel.findById(job.pipelineTemplateId);
    if (!pipeline || !pipeline.stages || pipeline.stages.length === 0) {
      throw new BadRequestException('Quy trình tuyển dụng của vị trí này chưa được thiết lập.');
    }

    // 1. Kiểm tra ứng viên đã nộp đơn vào vị trí này chưa (bằng bất kỳ hồ sơ nào)
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

    const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order);
    const initialStage = sortedStages[0];

    let candidate: CandidateDocument | null = null;
    let cvUrl: string | undefined = undefined;
    let cvOriginalName: string | undefined = undefined;
    let cvMimeType: string | undefined = undefined;
    let cvSize: number | undefined = undefined;
    let parsedCvText: string | undefined = undefined;
    let safeName = '';

    if (file && file.buffer && file.buffer.length > 0) {
      try {
        const uploadDir = path.join(process.cwd(), 'uploads', 'cvs');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(file.originalname) || '.pdf';
        safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, file.buffer);

        cvUrl = `/uploads/cvs/${safeName}`;
        cvOriginalName = file.originalname;
        cvMimeType = file.mimetype || 'application/pdf';
        cvSize = file.size || file.buffer.length;

        if (this.s3StorageService) {
          try {
            const s3Url = await this.s3StorageService.uploadCvFile(file, safeName);
            if (s3Url) {
              cvUrl = s3Url;
            }
          } catch (s3Err: any) {
            this.logger.warn(`[Apply CV] Upload S3 cảnh báo: ${s3Err?.message || s3Err}`);
          }
        }

        const rawBaseName = path.parse(file.originalname).name.trim() || 'Hồ sơ mới';

        const existingProfiles = await this.candidateModel
          .find({ userId: userObjId }, { profileName: 1 })
          .lean()
          .exec();

        const existingNames = new Set(
          existingProfiles.map((p) => p.profileName?.trim()).filter(Boolean),
        );

        let profileName = rawBaseName;
        if (existingNames.has(profileName)) {
          let counter = 1;
          while (existingNames.has(`${rawBaseName} (${counter})`)) {
            counter++;
          }
          profileName = `${rawBaseName} (${counter})`;
        }

        const isDefault = existingProfiles.length === 0;

        const newCandidate = await this.candidateModel.create({
          userId: userObjId,
          profileName,
          isDefault,
          cvPdfUrl: cvUrl,
          skills: [],
          experiences: [],
          educations: [],
          projects: [],
          certifications: [],
          languages: [],
        });

        candidate = newCandidate;
        this.logger.log(`[Apply CV] Đã tạo ngay hồ sơ mới ID: ${candidate._id} ("${candidate.profileName}"). S3 URL: ${cvUrl}`);
      } catch (err: any) {
        this.logger.error(`Lỗi khi lưu tệp CV tải lên: ${err?.message || err}`);
        throw new BadRequestException('Không thể lưu tệp CV tải lên. Vui lòng thử lại!');
      }
    } else if (candidateId) {
      candidate = await this.candidateModel.findOne({
        _id: new Types.ObjectId(candidateId),
        userId: userObjId,
      });
      if (!candidate) {
        throw new BadRequestException('Hồ sơ không tồn tại hoặc không thuộc về bạn.');
      }
      parsedCvText = this.aiMatchingService.buildFullCvText(candidate);
      cvUrl = candidate.cvPdfUrl;
    } else {
      throw new BadRequestException('Vui lòng chọn một hồ sơ hoặc tải lên tệp CV để ứng tuyển.');
    }

    if (!candidate) {
      throw new BadRequestException('Không thể khởi tạo hoặc xác thực hồ sơ ứng tuyển.');
    }

    const newApplication = await this.applicationModel.create({
      candidateId: candidate._id,
      jobDescriptionId: new Types.ObjectId(jobDescriptionId),
      currentStageId: initialStage._id,
      appliedAt: new Date(),
      cvUrl,
      cvOriginalName,
      cvMimeType,
      cvSize,
      parsedCvText,
    });

    const createdCandidateId = candidate._id;
    const applicationIdStr = newApplication._id.toString();

    setImmediate(async () => {
      try {
        if (file && file.buffer && file.buffer.length > 0) {
          this.logger.log(`[Background Job] Bắt đầu bóc tách CV ngầm cho Application ${applicationIdStr}...`);

          if (this.s3StorageService && (!cvUrl || cvUrl.startsWith('/uploads/'))) {
            try {
              const s3Url = await this.s3StorageService.uploadCvFile(file, safeName);
              if (s3Url) {
                cvUrl = s3Url;
                await Promise.all([
                  this.candidateModel.findByIdAndUpdate(createdCandidateId, { $set: { cvPdfUrl: s3Url } }),
                  this.applicationModel.findByIdAndUpdate(applicationIdStr, { $set: { cvUrl: s3Url } }),
                ]);
                this.logger.log(`[Background Job] Đã cập nhật S3 URL cho Candidate & Application: ${s3Url}`);
              }
            } catch (s3Err: any) {
              this.logger.warn(`[Background Job] S3 upload retry cảnh báo: ${s3Err?.message || s3Err}`);
            }
          }

          let structuredCv: any = null;
          let textExtracted = '';

          try {
            textExtracted = await this.extractTextFromFile(file);
          } catch (textErr: any) {
            this.logger.warn(`[Background Job] Trích xuất text thô: ${textErr?.message || textErr}`);
          }

          if (this.cvParserService) {
            try {
              structuredCv = await this.cvParserService.parseCvFileWithAi(file);
              this.logger.log(`[Background Job] Bóc tách cấu trúc CV bằng AI thành công cho Application ${applicationIdStr}`);
            } catch (parseErr: any) {
              this.logger.warn(`[Background Job] AI parse CV cảnh báo: ${parseErr?.message || parseErr}`);
            }
          }

          const updateFields: any = {};
          if (structuredCv?.headline) updateFields.headline = structuredCv.headline;
          if (structuredCv?.summary) updateFields.summary = structuredCv.summary;
          if (structuredCv?.careerObjective) updateFields.careerObjective = structuredCv.careerObjective;
          if (structuredCv?.address) updateFields.address = structuredCv.address;
          if (structuredCv?.skills?.length) updateFields.skills = structuredCv.skills;
          if (structuredCv?.experiences?.length) updateFields.experiences = structuredCv.experiences;
          if (structuredCv?.educations?.length) updateFields.educations = structuredCv.educations;
          if (structuredCv?.projects?.length) updateFields.projects = structuredCv.projects;
          if (structuredCv?.certifications?.length) updateFields.certifications = structuredCv.certifications;
          if (structuredCv?.languages?.length) updateFields.languages = structuredCv.languages;

          const updatedCandidate = await this.candidateModel.findByIdAndUpdate(
            createdCandidateId,
            { $set: updateFields },
            { new: true },
          );

          let finalCvText = updatedCandidate ? this.aiMatchingService.buildFullCvText(updatedCandidate) : '';
          if (!finalCvText || finalCvText.trim().length < 50) {
            finalCvText = textExtracted;
          }

          if (finalCvText && finalCvText.trim().length > 0) {
            await this.applicationModel.findByIdAndUpdate(applicationIdStr, {
              $set: { parsedCvText: finalCvText },
            });
          }
        }

        if (this.awsSqsService) {
          const messageId = await this.awsSqsService.sendMatchingJob({
            applicationId: applicationIdStr,
            s3Url: cvUrl,
            safeName,
            timestamp: Date.now(),
          });
          if (!messageId) {
            await this.aiMatchingProcessor.processMatching(applicationIdStr);
          }
        } else {
          await this.aiMatchingProcessor.processMatching(applicationIdStr);
        }
      } catch (bgErr: any) {
        this.logger.error(`[Background Job] Lỗi khi xử lý ngầm bóc tách hoặc chấm điểm: ${bgErr?.message || bgErr}`);
      }
    });

    // Bắn thông báo khi có ứng viên mới nộp hồ sơ
    try {
      const candidateDoc = await this.candidateModel.findById(candidate._id).populate('userId');
      const candidateUser = candidateDoc?.userId as any;
      const candName = candidateUser?.name || (candidateDoc as any)?.profileName || 'Ứng viên mới';
      const deptId = (job.departmentId as any)?._id
        ? (job.departmentId as any)._id.toString()
        : (job.departmentId as any)?.toString();

      // Thông báo HR Admin
      await this.notificationsService.notifyHrAdmins({
        title: 'Ứng viên mới nộp hồ sơ',
        message: `Ứng viên ${candName} vừa nộp hồ sơ ứng tuyển vị trí "${job.title}".`,
        type: NotificationType.APPLICATION_SUBMITTED,
        category: NotificationCategory.CANDIDATE,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/kanban',
        metadata: {
          applicationId: newApplication._id.toString(),
          jobId: job._id.toString(),
          candidateId: candidate._id.toString(),
        },
      });

      // Thông báo Trưởng phòng ban
      if (deptId) {
        await this.notificationsService.notifyDepartmentManagers(deptId, {
          title: 'Ứng viên mới nộp hồ sơ',
          message: `Ứng viên ${candName} vừa nộp hồ sơ ứng tuyển vị trí "${job.title}" thuộc phòng ban của bạn.`,
          type: NotificationType.APPLICATION_SUBMITTED,
          category: NotificationCategory.CANDIDATE,
          priority: NotificationPriority.MEDIUM,
          actionUrl: '/kanban',
          metadata: {
            applicationId: newApplication._id.toString(),
            jobId: job._id.toString(),
            candidateId: candidate._id.toString(),
          },
        });
      }
    } catch (notifErr) {
      this.logger.error('Lỗi khi gửi thông báo nộp hồ sơ:', notifErr);
    }

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
    } else if (params.departmentId && Types.ObjectId.isValid(params.departmentId)) {
      const jobsInDept = await this.jobModel
        .find({ departmentId: new Types.ObjectId(params.departmentId) })
        .select('_id')
        .lean()
        .exec();
      const jobIds = jobsInDept.map((j) => j._id);
      query.jobDescriptionId = { $in: jobIds };
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
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    // Lấy thông tin AI Evaluation & Lịch phỏng vấn gắn vào từng Application
    const appIds = applications.map((app) => app._id);
    const [evaluations, interviews] = await Promise.all([
      this.aiEvaluationModel
        .find({ applicationId: { $in: appIds } })
        .lean()
        .exec(),
      this.interviewModel
        .find({ applicationId: { $in: appIds } })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);

    const evalMap = new Map<string, any>();
    evaluations.forEach((item) => {
      evalMap.set(item.applicationId.toString(), item);
    });

    const interviewMap = new Map<string, any>();
    interviews.forEach((inv) => {
      const key = inv.applicationId.toString();
      if (!interviewMap.has(key)) {
        interviewMap.set(key, inv);
      }
    });

    let filtered = applications.map((app: any) => {
      const aiEval = evalMap.get(app._id.toString());
      const inv = interviewMap.get(app._id.toString());
      const job = app.jobDescriptionId as any;
      const pipeline = job?.pipelineTemplateId;
      let currentStage = pipeline?.stages?.find(
        (s: any) => s._id?.toString() === app.currentStageId?.toString(),
      );

      // Nếu ứng viên đã được nhận việc (HIRED), đảm bảo stage được map vào Hired stage
      if (app.status === ApplicationStatus.HIRED) {
        const hiredStage = pipeline?.stages?.find(
          (s: any) => {
            const st = s.stageType || s.type;
            const nameLower = (s.name || '').trim().toLowerCase();
            return (
              st === StageType.HIRED ||
              st === 'HIRED' ||
              nameLower.includes('hired') ||
              nameLower.includes('trúng tuyển') ||
              nameLower.includes('nhận việc') ||
              nameLower.includes('đã tuyển')
            );
          },
        ) || (pipeline?.stages && pipeline.stages[pipeline.stages.length - 1]);
        if (hiredStage) {
          currentStage = hiredStage;
          app.currentStageId = hiredStage._id;
        }
      }

      return {
        ...app,
        stageName: currentStage?.name || 'Mới',
        stageColor: currentStage?.color || '#94a3b8',
        currentStage: currentStage || null,
        aiFitScore: aiEval?.aiFitScore ?? app?.aiFitScore ?? null,
        evidenceStrengthScore: aiEval?.evidenceStrengthScore ?? 0,
        isMissingMandatory: Boolean(aiEval?.isMissingMandatory),
        aiEvaluation: aiEval || null,
        interviewStatus: inv?.status || null,
        interviewConfirmationStatus: inv?.confirmationStatus || null,
        interviewCancelReason: inv?.cancelReason || null,
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

  private extractDeptId(rawDept: any): string | undefined {
    if (!rawDept) return undefined;
    if (rawDept._id) return rawDept._id.toString();
    return rawDept.toString();
  }

  async updateApplicationStage(applicationId: string, stageId: string) {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestException('ID đơn ứng tuyển không hợp lệ');
    }

    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    // Không cho phép chuyển ứng viên về giai đoạn trước đó (chỉ cho phép tiến lên)
    const currentStageId = application.currentStageId?.toString();
    if (currentStageId && currentStageId !== stageId) {
      const job = await this.jobModel.findById(application.jobDescriptionId).exec();
      if (job?.pipelineTemplateId) {
        const pipeline = await this.pipelineModel.findById(job.pipelineTemplateId).exec();
        if (pipeline && Array.isArray(pipeline.stages) && pipeline.stages.length > 0) {
          const sortedStages = [...pipeline.stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const currentIdx = sortedStages.findIndex(
            (s: any) => s._id?.toString() === currentStageId || s.name === currentStageId,
          );
          const targetIdx = sortedStages.findIndex(
            (s: any) => s._id?.toString() === stageId || s.name === stageId,
          );
          if (currentIdx !== -1 && targetIdx !== -1 && targetIdx < currentIdx) {
            throw new BadRequestException('Không thể chuyển ứng viên về giai đoạn tuyển dụng trước đó');
          }
        }
      }
    }

    application.currentStageId = stageId as any;
    const updated = await application.save();

    const populated = await this.getApplicationById(updated._id.toString());

    try {
      const job = populated.jobDescriptionId as any;
      const departmentId = this.extractDeptId(job?.departmentId);

      const pipeline = job?.pipelineTemplateId as any;
      let stageName = '';
      let stageType: StageType | undefined;
      if (pipeline && Array.isArray(pipeline.stages)) {
        const foundStage = pipeline.stages.find(
          (s: any) => s._id?.toString() === stageId || s.name === stageId,
        );
        if (foundStage) {
          stageName = foundStage.name;
          stageType = foundStage.stageType;
        }
      }

      if (!stageName && Types.ObjectId.isValid(stageId)) {
        const pipelineWithStage = await this.pipelineModel
          .findOne({ 'stages._id': new Types.ObjectId(stageId) })
          .lean()
          .exec();
        if (pipelineWithStage && Array.isArray(pipelineWithStage.stages)) {
          const found = pipelineWithStage.stages.find(
            (s: any) => s._id?.toString() === stageId,
          );
          if (found) {
            stageName = found.name;
            stageType = found.stageType;
          }
        }
      }

      const stageLower = (stageName || stageId).toLowerCase();
      this.logger.log(`updateApplicationStage: appId=${applicationId}, stageId=${stageId}, stageName="${stageName}", deptId="${departmentId}"`);

      // 1. Nhận diện vòng Đánh giá phòng ban
      const isDeptReview =
        stageType === StageType.DEPARTMENT_REVIEW ||
        stageType === StageType.INTERVIEW ||
        stageLower.includes('department') ||
        stageLower.includes('phòng ban') ||
        stageLower.includes('chuyên môn') ||
        stageLower.includes('đánh giá') ||
        stageLower.includes('phỏng vấn');

      const isHired =
        stageType === StageType.HIRED ||
        stageLower.includes('hired') ||
        stageLower.includes('trúng tuyển') ||
        stageLower.includes('nhận việc');

      const candidate = populated.candidateId as any;
      const user = candidate?.userId as any;
      const candidateName = user?.name || candidate?.fullName || candidate?.profileName || 'Ứng viên';
      const candidateUserId = user?._id?.toString() || user?.toString() || candidate?.userId?.toString();
      const jobTitle = job?.title || 'Vị trí tuyển dụng';

      if (isDeptReview && !isHired) {
        this.logger.log(`Phát hiện chuyển sang vòng Đánh giá phòng ban. Khởi tạo lịch và thông báo Trưởng phòng (departmentId: ${departmentId})...`);

        try {
          let interview = await this.interviewModel.findOne({ applicationId: populated._id }).exec();
          if (!interview) {
            const defaultInterviewer = job?.interviewerId || populated.candidateId;
            interview = new this.interviewModel({
              applicationId: populated._id,
              candidateId: populated.candidateId?._id || populated.candidateId,
              jobDescriptionId: job?._id || populated.jobDescriptionId,
              interviewerId: defaultInterviewer || new Types.ObjectId(),
              locationType: LocationType.ONLINE,
              status: InterviewStatus.SCHEDULED,
              result: InterviewResult.PENDING,
              confirmationStatus: InterviewConfirmationStatus.WAITING_DEPT_SCHEDULE,
            });
            await interview.save();
          } else if (!interview.date || !interview.startTime) {
            interview.confirmationStatus = InterviewConfirmationStatus.WAITING_DEPT_SCHEDULE;
            await interview.save();
          }
        } catch (invErr) {
          this.logger.error('Lỗi khởi tạo interview khi chuyển stage:', invErr);
        }

        if (departmentId) {
          await this.notificationsService.notifyDepartmentReview({
            applicationId: populated._id.toString(),
            candidateName,
            jobTitle,
            departmentId,
            stageName: stageName || 'Đánh giá phòng ban',
          });
        } else {
          this.logger.warn(`Không tìm thấy departmentId để gửi notifyDepartmentReview cho đơn ${applicationId}`);
        }
      }

      if (isHired) {
        await this.applicationModel.findByIdAndUpdate(applicationId, {
          $set: { status: ApplicationStatus.HIRED },
        }).exec();

        await this.notificationsService.notifyCandidateHired({
          candidateName,
          jobTitle,
          candidateUserId,
          applicationId: populated._id.toString(),
          departmentId,
        });
      } else if (candidateUserId && stageName) {
        await this.notificationsService.notifyCandidateStageChanged(candidateUserId, {
          jobTitle,
          stageName,
          applicationId: populated._id.toString(),
        });
      }
    } catch (notifErr) {
      this.logger.error('Lỗi khi gửi thông báo chuyển vòng ứng tuyển:', notifErr);
    }

    return populated;
  }

  async getApplicationById(applicationId: string) {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate({
        path: 'jobDescriptionId',
        populate: [
          { path: 'pipelineTemplateId' },
          { path: 'departmentId' },
        ],
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

    const aiEval = await this.aiEvaluationModel
      .findOne({ applicationId: application._id })
      .lean()
      .exec();

    return {
      ...application.toObject(),
      stageName: currentStage?.name || 'Không xác định',
      stageColor: currentStage?.color || '#94a3b8',
      currentStage,
      aiEvaluation: aiEval || null,
      aiFitScore: aiEval?.aiFitScore ?? (application as any).aiFitScore ?? null,
      evidenceStrengthScore: aiEval?.evidenceStrengthScore ?? 0,
      isMissingMandatory: Boolean(aiEval?.isMissingMandatory),
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

  async rejectApplication(
    applicationId: string,
    reason: string,
    authorName: string = 'Hệ thống',
    authorRole: string = 'Người đánh giá',
  ) {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestException('ID đơn ứng tuyển không hợp lệ');
    }

    const application = await this.applicationModel.findById(applicationId).exec();
    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    application.status = ApplicationStatus.REJECTED;
    application.reviewStatus = 'Rejected';
    application.rejectReason = reason ? reason.trim() : 'Không đạt yêu cầu vị trí';
    application.rejectedAt = new Date();

    if (!application.notes) {
      application.notes = [];
    }
    if (reason && reason.trim()) {
      application.notes.push({
        authorName,
        authorRole,
        content: `[LÝ DO TỪ CHỐI]: ${reason.trim()}`,
        createdAt: new Date(),
      } as any);
    }

    await application.save();

    try {
      const populated = await this.applicationModel
        .findById(applicationId)
        .populate({
          path: 'candidateId',
          populate: { path: 'userId', select: 'name email phone avatar' },
        })
        .populate('jobDescriptionId')
        .exec();

      if (populated) {
        const candidate = populated.candidateId as any;
        const candidateUser = candidate?.userId as any;
        const candidateUserId = candidateUser?._id?.toString() || candidateUser?.toString();
        const candidateName = candidateUser?.name || candidate?.fullName || candidate?.profileName || 'Ứng viên';
        const job = populated.jobDescriptionId as any;
        const jobTitle = job?.title || 'Vị trí tuyển dụng';
        const departmentId = this.extractDeptId(job?.departmentId);

        await this.notificationsService.notifyCandidateRejectedByHr({
          candidateName,
          jobTitle,
          reason: application.rejectReason,
          candidateUserId,
          applicationId: application._id.toString(),
          departmentId,
        });

        // Gửi email từ chối cho ứng viên
        const candidateEmail = candidateUser?.email;
        if (candidateEmail) {
          try {
            await this.emailService.sendRejectionEmail({
              toEmail: candidateEmail,
              candidateName,
              jobTitle,
              companyName: 'TalentCore',
              managerName: authorName || 'Ban Tuyển dụng TalentCore',
              reason: application.rejectReason,
            });
          } catch (emailErr) {
            this.logger.error('Lỗi khi gửi email từ chối ứng viên:', emailErr);
          }
        }
      }
    } catch (notifErr) {
      this.logger.error('Lỗi khi gửi thông báo hoặc email từ chối ứng viên:', notifErr);
    }

    return this.getApplicationById(applicationId);
  }

  async deleteApplication(applicationId: string) {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestException('ID đơn ứng tuyển không hợp lệ');
    }

    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    if (application.status === ApplicationStatus.HIRED) {
      throw new BadRequestException('Không thể xóa đơn ứng tuyển của ứng viên đã được nhận việc (HIRED)');
    }

    // Cascade delete related records
    await Promise.all([
      this.interviewModel.deleteMany({ applicationId: application._id }),
      this.aiEvaluationModel.deleteMany({ applicationId: application._id }),
      this.applicationModel.findByIdAndDelete(applicationId),
    ]);

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

  async reEvaluateApplication(applicationId: string) {
    const app = await this.applicationModel.findById(applicationId);
    if (!app) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    setImmediate(() => {
      this.aiMatchingProcessor
        .processMatching(applicationId, {
          jobId: 'MANUAL_RE_EVALUATE',
          attempt: 1,
        })
        .catch((err) => {
          this.logger.error(
            `[ApplicationService] Chấm lại thủ công thất bại cho Application ${applicationId}: ${err?.message || err}`,
          );
        });
    });

    return {
      applicationId,
      status: 'PROCESSING',
      message: 'Đã đưa vào tiến trình chấm điểm AI',
    };
  }

  private async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    try {
      const mimeType = (file.mimetype || '').toLowerCase();
      const originalName = (file.originalname || '').toLowerCase();

      if (originalName.endsWith('.docx') || mimeType.includes('wordprocessingml')) {
        const mammoth = require('mammoth');
        const res = await mammoth.extractRawText({ buffer: file.buffer });
        return (res.value || '').trim();
      }

      if (originalName.endsWith('.pdf') || mimeType.includes('pdf')) {
        const pdfModule = require('pdf-parse');
        if (pdfModule?.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: file.buffer });
          const res = await parser.getText();
          return (res?.text || '').trim();
        } else if (typeof pdfModule === 'function') {
          const data = await pdfModule(file.buffer);
          return (data?.text || '').trim();
        } else if (typeof pdfModule?.default === 'function') {
          const data = await pdfModule.default(file.buffer);
          return (data?.text || '').trim();
        } else if (pdfModule?.default?.PDFParse) {
          const parser = new pdfModule.default.PDFParse({ data: file.buffer });
          const res = await parser.getText();
          return (res?.text || '').trim();
        }
      }
    } catch (e: any) {
      this.logger.warn(`[extractTextFromFile] Không thể trích xuất văn bản thô: ${e?.message || e}`);
    }
    return '';
  }
}