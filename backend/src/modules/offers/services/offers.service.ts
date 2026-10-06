import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Offer, OfferDocument, OfferStatus } from '../schemas/offer.schema';
import { Application, ApplicationDocument, ApplicationStatus } from '../../applications/schemas/application.schema';
import { Candidate, CandidateDocument } from '../../candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionDocument } from '../../job-description/schemas/job-description.schema';
import { Department, DepartmentDocument } from '../../departments/schemas/department.schema';
import { User, UserDocument, UserRole } from '../../users/schemas/user.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { EmailService } from '../../email-template/services/email.service';
import { CreateOfferDto } from '../dtos/create-offer.dto';
import { UpdateOfferDto } from '../dtos/update-offer.dto';
import { RespondOfferDto } from '../dtos/respond-offer.dto';
import { QueryOfferDto } from '../dtos/query-offer.dto';
import { StageType } from '../../pipeline-template/schemas/pipeline-template.schema';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(JobDescription.name)
    private readonly jobDescriptionModel: Model<JobDescriptionDocument>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateOfferDto, userId: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(dto.applicationId)) {
      throw new BadRequestException('Application ID không hợp lệ');
    }

    const application = await this.applicationModel.findById(dto.applicationId).exec();
    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    // Check if there is an active offer for this application
    const existingOffer = await this.offerModel.findOne({
      applicationId: new Types.ObjectId(dto.applicationId),
      status: { $in: [OfferStatus.DRAFT, OfferStatus.SENT, OfferStatus.ACCEPTED] },
    }).exec();

    if (existingOffer) {
      throw new BadRequestException(
        `Đã có Offer ở trạng thái ${existingOffer.status} cho hồ sơ ứng tuyển này`,
      );
    }

    const status = dto.sendImmediately ? OfferStatus.SENT : OfferStatus.DRAFT;
    const sentAt = dto.sendImmediately ? new Date() : undefined;

    const offer = new this.offerModel({
      applicationId: new Types.ObjectId(dto.applicationId),
      candidateId: new Types.ObjectId(dto.candidateId),
      jobDescriptionId: new Types.ObjectId(dto.jobDescriptionId),
      departmentId: new Types.ObjectId(dto.departmentId),
      createdById: new Types.ObjectId(userId),
      positionTitle: dto.positionTitle,
      contractType: dto.contractType,
      workLocation: dto.workLocation,
      salary: dto.salary,
      currency: dto.currency || 'VND',
      probationDurationMonths: dto.probationDurationMonths ?? 2,
      probationSalaryPercentage: dto.probationSalaryPercentage ?? 85,
      startDate: new Date(dto.startDate),
      expirationDate: new Date(dto.expirationDate),
      benefits: dto.benefits || [],
      notes: dto.notes,
      emailSubject: dto.emailSubject,
      offerLetterHtml: dto.offerLetterHtml,
      status,
      sentAt,
    });

    const savedOffer = await offer.save();

    if (dto.sendImmediately) {
      savedOffer.otpCode = this.generateOtp();
      savedOffer.otpExpiresAt = savedOffer.expirationDate;
      await savedOffer.save();
      await this.notifyCandidateForOffer(savedOffer);
      await this.sendOfferEmailToCandidate(savedOffer);
    }

    return savedOffer;
  }

  async findAll(query: QueryOfferDto, currentUser: any) {
    const { page = 1, limit = 10, status, departmentId, jobDescriptionId, search } = query;
    const filter: any = {};

    // RBAC: Department Manager can only see offers of their department
    if (currentUser.role === UserRole.DEPARTMENT_MANAGER && currentUser.departmentId) {
      filter.departmentId = new Types.ObjectId(currentUser.departmentId);
    } else if (departmentId && Types.ObjectId.isValid(departmentId)) {
      filter.departmentId = new Types.ObjectId(departmentId);
    }

    if (status) {
      filter.status = status;
    }

    if (jobDescriptionId && Types.ObjectId.isValid(jobDescriptionId)) {
      filter.jobDescriptionId = new Types.ObjectId(jobDescriptionId);
    }

    if (search) {
      filter.positionTitle = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.offerModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'candidateId',
          select: 'userId profileName address cvPdfUrl',
          populate: { path: 'userId', select: 'name email phone avatar' },
        })
        .populate({
          path: 'jobDescriptionId',
          select: 'title departmentId',
        })
        .populate({
          path: 'departmentId',
          select: 'name code',
        })
        .populate({
          path: 'createdById',
          select: 'name email role',
        })
        .exec(),
      this.offerModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Offer ID không hợp lệ');
    }

    const offer = await this.offerModel
      .findById(id)
      .populate({
        path: 'candidateId',
        select: 'userId profileName address cvPdfUrl skills experiences',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .populate({
        path: 'jobDescriptionId',
        select: 'title departmentId employmentType',
      })
      .populate({
        path: 'departmentId',
        select: 'name code',
      })
      .populate({
        path: 'createdById',
        select: 'name email role',
      })
      .populate({
        path: 'applicationId',
        select: 'status currentStageId appliedAt',
      })
      .exec();

    if (!offer) {
      throw new NotFoundException('Không tìm thấy lời mời nhận việc');
    }

    return offer;
  }

  async update(id: string, dto: UpdateOfferDto, userId: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Offer ID không hợp lệ');
    }

    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException('Không tìm thấy lời mời nhận việc');
    }

    if (offer.status === OfferStatus.ACCEPTED || offer.status === OfferStatus.DECLINED) {
      throw new BadRequestException('Không thể chỉnh sửa Offer đã được ứng viên phản hồi (Đồng ý hoặc Từ chối)');
    }

    if (dto.positionTitle !== undefined) offer.positionTitle = dto.positionTitle;
    if (dto.contractType !== undefined) offer.contractType = dto.contractType;
    if (dto.workLocation !== undefined) offer.workLocation = dto.workLocation;
    if (dto.salary !== undefined) offer.salary = dto.salary;
    if (dto.currency !== undefined) offer.currency = dto.currency;
    if (dto.probationDurationMonths !== undefined) offer.probationDurationMonths = dto.probationDurationMonths;
    if (dto.probationSalaryPercentage !== undefined) offer.probationSalaryPercentage = dto.probationSalaryPercentage;
    if (dto.startDate !== undefined) offer.startDate = new Date(dto.startDate);
    if (dto.expirationDate !== undefined) offer.expirationDate = new Date(dto.expirationDate);
    if (dto.benefits !== undefined) offer.benefits = dto.benefits;
    if (dto.notes !== undefined) offer.notes = dto.notes;
    if (dto.emailSubject !== undefined) offer.emailSubject = dto.emailSubject;
    if (dto.offerLetterHtml !== undefined) offer.offerLetterHtml = dto.offerLetterHtml;

    return await offer.save();
  }

  async sendOffer(id: string, userId: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Offer ID không hợp lệ');
    }

    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException('Không tìm thấy lời mời nhận việc');
    }

    if (offer.status === OfferStatus.ACCEPTED || offer.status === OfferStatus.DECLINED) {
      throw new BadRequestException('Không thể gửi lại Offer đã được ứng viên phản hồi');
    }

    offer.status = OfferStatus.SENT;
    offer.sentAt = new Date();
    offer.otpCode = this.generateOtp();
    offer.otpExpiresAt = offer.expirationDate;

    const updatedOffer = await offer.save();

    await this.notifyCandidateForOffer(updatedOffer);
    await this.sendOfferEmailToCandidate(updatedOffer);

    this.logger.log(`Offer ${id} marked as SENT. Notification & email dispatched.`);

    return updatedOffer;
  }

  async withdrawOffer(id: string, userId: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Offer ID không hợp lệ');
    }

    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException('Không tìm thấy lời mời nhận việc');
    }

    if (offer.status === OfferStatus.ACCEPTED) {
      throw new BadRequestException('Không thể thu hồi Offer đã được ứng viên chấp nhận');
    }

    offer.status = OfferStatus.CANCELLED;
    return await offer.save();
  }

  async candidateRespond(
    id: string,
    candidateUserId: string,
    dto: RespondOfferDto,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Offer ID không hợp lệ');
    }

    const offer = await this.offerModel
      .findById(id)
      .populate<{ candidateId: CandidateDocument }>('candidateId')
      .populate<{ jobDescriptionId: JobDescriptionDocument }>('jobDescriptionId')
      .exec();

    if (!offer) {
      throw new NotFoundException('Không tìm thấy lời mời nhận việc');
    }

    // Verify ownership: candidate's userId must match candidateUserId
    const candidate = offer.candidateId as unknown as CandidateDocument;
    if (!candidate || candidate.userId?.toString() !== candidateUserId.toString()) {
      throw new ForbiddenException('Bạn không có quyền phản hồi lời mời nhận việc này');
    }

    if (offer.status !== OfferStatus.SENT) {
      throw new BadRequestException('Lời mời nhận việc không ở trạng thái chờ phản hồi');
    }

    // Check expiration date
    if (new Date() > new Date(offer.expirationDate)) {
      offer.status = OfferStatus.EXPIRED;
      await offer.save();
      throw new BadRequestException('Lời mời nhận việc này đã quá hạn phản hồi');
    }

    const user = await this.userModel.findById(candidateUserId).exec();
    const candidateName = user?.name || candidate.profileName || 'Ứng viên';
    const jobTitle = (offer.jobDescriptionId as unknown as JobDescriptionDocument)?.title || offer.positionTitle;
    const deptId = offer.departmentId?.toString();

    if (dto.action === 'ACCEPT') {
      if (offer.otpCode) {
        const inputOtp = dto.otp ? String(dto.otp).trim() : '';
        if (!inputOtp) {
          throw new BadRequestException('Vui lòng nhập mã OTP được gửi trong email để xác nhận nhận việc');
        }
        if (inputOtp !== offer.otpCode) {
          throw new BadRequestException('Mã OTP không chính xác. Vui lòng kiểm tra lại email nhận việc.');
        }
        if (offer.otpExpiresAt && new Date() > new Date(offer.otpExpiresAt)) {
          throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng liên hệ nhà tuyển dụng.');
        }
      }

      const session = await this.connection.startSession();
      let useTransaction = true;
      try {
        session.startTransaction();
      } catch {
        useTransaction = false;
      }

      try {
        offer.status = OfferStatus.ACCEPTED;
        offer.respondedAt = new Date();

        // Automatically resolve Hired stage from the job's pipeline template
        let hiredStageId: Types.ObjectId | string | undefined;
        try {
          const app = await this.applicationModel.findById(offer.applicationId).exec();
          if (app) {
            const job = await this.jobDescriptionModel
              .findById(app.jobDescriptionId)
              .populate('pipelineTemplateId')
              .exec();

            const pipeline = job?.pipelineTemplateId as any;
            if (pipeline && Array.isArray(pipeline.stages) && pipeline.stages.length > 0) {
              const hiredStage = pipeline.stages.find((s: any) => {
                const type = s.stageType;
                const nameLower = (s.name || '').toLowerCase();
                return (
                  type === StageType.HIRED ||
                  nameLower.includes('hired') ||
                  nameLower.includes('trúng tuyển') ||
                  nameLower.includes('nhận việc') ||
                  nameLower.includes('đã tuyển')
                );
              }) || pipeline.stages[pipeline.stages.length - 1];

              if (hiredStage?._id) {
                hiredStageId = hiredStage._id;
              }
            }
          }
        } catch (findStageErr) {
          this.logger.error('Lỗi tìm stage Hired cho offer:', findStageErr);
        }

        const applicationUpdate: any = {
          status: ApplicationStatus.HIRED,
        };
        if (hiredStageId) {
          applicationUpdate.currentStageId = hiredStageId;
        }

        if (useTransaction) {
          await offer.save({ session });
          await this.applicationModel.findByIdAndUpdate(
            offer.applicationId,
            { $set: applicationUpdate },
            { session },
          ).exec();
          await session.commitTransaction();
        } else {
          await offer.save();
          await this.applicationModel.findByIdAndUpdate(
            offer.applicationId,
            { $set: applicationUpdate },
          ).exec();
        }
      } catch (error) {
        if (useTransaction) {
          await session.abortTransaction();
        }
        throw error;
      } finally {
        session.endSession();
      }

      // Notify HR and Department Managers
      await this.notificationsService.notifyHrOfferAccepted({
        candidateName,
        jobTitle,
        offerId: offer._id.toString(),
        departmentId: deptId,
      });

      const candidateUserIdStr = candidate.userId?.toString();
      await this.notificationsService.notifyCandidateHired({
        candidateName,
        jobTitle,
        candidateUserId: candidateUserIdStr,
        applicationId: offer.applicationId?.toString(),
        departmentId: deptId,
      });

      this.logger.log(`Offer ${id} ACCEPTED. Application ${offer.applicationId} updated to HIRED.`);
    } else {
      offer.status = OfferStatus.DECLINED;
      offer.respondedAt = new Date();
      offer.declineReason = dto.declineReason;
      await offer.save();

      // Notify HR and Department Managers
      await this.notificationsService.notifyHrOfferDeclined({
        candidateName,
        jobTitle,
        offerId: offer._id.toString(),
        declineReason: dto.declineReason,
        departmentId: deptId,
      });

      this.logger.log(`Offer ${id} DECLINED with reason: ${dto.declineReason}`);
    }

    return offer;
  }

  async getMyOffers(candidateUserId: string) {
    if (!Types.ObjectId.isValid(candidateUserId)) {
      throw new BadRequestException('Candidate User ID không hợp lệ');
    }

    // Find candidate profiles for this user
    const candidates = await this.candidateModel.find({
      userId: new Types.ObjectId(candidateUserId),
    }).exec();

    if (!candidates || candidates.length === 0) {
      return [];
    }

    const candidateIds = candidates.map((c) => c._id);

    // Candidates can only see offers that have been SENT, ACCEPTED, DECLINED, EXPIRED, CANCELLED (not DRAFT)
    const offers = await this.offerModel
      .find({
        candidateId: { $in: candidateIds },
        status: { $ne: OfferStatus.DRAFT },
      })
      .select('-otpCode')
      .sort({ createdAt: -1 })
      .populate({
        path: 'jobDescriptionId',
        select: 'title employmentType departmentId',
      })
      .populate({
        path: 'departmentId',
        select: 'name code',
      })
      .exec();

    return offers;
  }

  private async notifyCandidateForOffer(offer: OfferDocument) {
    try {
      let candidate = await this.candidateModel
        .findById(offer.candidateId)
        .populate('userId')
        .exec();

      if (!candidate || !candidate.userId) {
        candidate = await this.candidateModel
          .findOne({ userId: offer.candidateId })
          .populate('userId')
          .exec();
      }

      if ((!candidate || !candidate.userId) && offer.applicationId) {
        const app = await this.applicationModel
          .findById(offer.applicationId)
          .populate({
            path: 'candidateId',
            populate: { path: 'userId' },
          })
          .exec();
        if (app && app.candidateId) {
          candidate = app.candidateId as any;
        }
      }

      const expirationDateFormatted = new Date(offer.expirationDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      let candidateUserId: string | undefined;
      let candidateName = 'Ứng viên';

      if (candidate) {
        const user = candidate.userId as any;
        if (user && typeof user === 'object' && user._id) {
          candidateUserId = user._id.toString();
          candidateName = user.name || candidate.profileName || 'Ứng viên';
        } else if (candidate.userId) {
          candidateUserId = candidate.userId.toString();
          candidateName = candidate.profileName || 'Ứng viên';
        }
      }

      if (!candidateUserId && offer.candidateId) {
        const directUser = await this.userModel.findById(offer.candidateId).exec();
        if (directUser) {
          candidateUserId = directUser._id.toString();
          candidateName = directUser.name || 'Ứng viên';
        }
      }

      if (candidateUserId) {
        await this.notificationsService.notifyCandidateOfferSent(
          candidateUserId,
          {
            jobTitle: offer.positionTitle,
            offerId: offer._id.toString(),
            expirationDateFormatted,
          },
        );
        this.logger.log(`Đã gửi thông báo Offer cho Ứng viên (userId: ${candidateUserId}, offerId: ${offer._id})`);
      } else {
        this.logger.warn(`Không tìm thấy userId của ứng viên để gửi thông báo Offer (offerId: ${offer._id})`);
      }

      if (offer.departmentId) {
        const salaryFormatted = offer.salary
          ? `${offer.salary.toLocaleString('vi-VN')} ${offer.currency || 'VND'}`
          : 'Thỏa thuận';

        await this.notificationsService.notifyDeptOfferSent({
          candidateName,
          jobTitle: offer.positionTitle,
          salaryFormatted,
          expirationDateFormatted,
          offerId: offer._id.toString(),
          departmentId: offer.departmentId.toString(),
        });
      }
    } catch (err) {
      this.logger.error('Lỗi khi gửi thông báo Offer cho ứng viên / Trưởng phòng:', err);
    }
  }

  private async sendOfferEmailToCandidate(offer: OfferDocument) {
    try {
      let candidate = await this.candidateModel
        .findById(offer.candidateId)
        .populate('userId')
        .exec();

      if (!candidate || !candidate.userId) {
        candidate = await this.candidateModel
          .findOne({ userId: offer.candidateId })
          .populate('userId')
          .exec();
      }

      if ((!candidate || !candidate.userId) && offer.applicationId) {
        const app = await this.applicationModel
          .findById(offer.applicationId)
          .populate({
            path: 'candidateId',
            populate: { path: 'userId' },
          })
          .exec();
        if (app && app.candidateId) {
          candidate = app.candidateId as any;
        }
      }

      let candidateEmail: string | undefined;
      let candidateName = 'Ứng viên';

      if (candidate) {
        const user = candidate.userId as any;
        if (user && typeof user === 'object') {
          candidateEmail = user.email;
          candidateName = user.name || candidate.profileName || 'Ứng viên';
        }
      }

      if (!candidateEmail && offer.candidateId) {
        const directUser = await this.userModel.findById(offer.candidateId).exec();
        if (directUser) {
          candidateEmail = directUser.email;
          candidateName = directUser.name || 'Ứng viên';
        }
      }

      if (!candidateEmail) {
        this.logger.warn(
          `Không tìm thấy email của ứng viên để gửi Offer Email (offerId: ${offer._id})`,
        );
        return;
      }

      await this.emailService.sendOfferEmail({
        toEmail: candidateEmail,
        candidateName,
        jobTitle: offer.positionTitle,
        companyName: 'TalentCore',
        customSubject: offer.emailSubject,
        customLetterHtml: offer.offerLetterHtml,
        otpCode: offer.otpCode,
      });

      this.logger.log(
        `Đã gửi email Offer cho ứng viên ${candidateEmail} (offerId: ${offer._id})`,
      );
    } catch (error: any) {
      this.logger.error(
        `Lỗi gửi email Offer cho ứng viên (offerId: ${offer._id}): ${error?.message || error}`,
      );
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
