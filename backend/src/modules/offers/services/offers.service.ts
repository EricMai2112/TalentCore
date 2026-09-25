import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Offer, OfferDocument, OfferStatus } from '../schemas/offer.schema';
import { Application, ApplicationDocument, ApplicationStatus } from '../../applications/schemas/application.schema';
import { Candidate, CandidateDocument } from '../../candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionDocument } from '../../job-description/schemas/job-description.schema';
import { Department, DepartmentDocument } from '../../departments/schemas/department.schema';
import { User, UserDocument, UserRole } from '../../users/schemas/user.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { CreateOfferDto } from '../dtos/create-offer.dto';
import { UpdateOfferDto } from '../dtos/update-offer.dto';
import { RespondOfferDto } from '../dtos/respond-offer.dto';
import { QueryOfferDto } from '../dtos/query-offer.dto';

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
    private readonly notificationsService: NotificationsService,
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

    // If sent immediately, dispatch notification to candidate
    if (dto.sendImmediately) {
      await this.notifyCandidateForOffer(savedOffer);
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

    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể chỉnh sửa Offer ở trạng thái Bản nháp (DRAFT)');
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

    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể gửi Offer đang ở trạng thái Bản nháp (DRAFT)');
    }

    offer.status = OfferStatus.SENT;
    offer.sentAt = new Date();

    const updatedOffer = await offer.save();

    // Notify candidate
    await this.notifyCandidateForOffer(updatedOffer);

    // [NOTE: Gửi mail AWS SES sẽ thực hiện ở giai đoạn sau theo yêu cầu]
    this.logger.log(`Offer ${id} marked as SENT. Email dispatch postponed as requested.`);

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
      offer.status = OfferStatus.ACCEPTED;
      offer.respondedAt = new Date();
      await offer.save();

      // Crucial automation: Update Application status to HIRED
      await this.applicationModel.findByIdAndUpdate(offer.applicationId, {
        $set: { status: ApplicationStatus.HIRED },
      }).exec();

      // Notify HR and Department Managers
      await this.notificationsService.notifyHrOfferAccepted({
        candidateName,
        jobTitle,
        offerId: offer._id.toString(),
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
      const candidate = await this.candidateModel.findById(offer.candidateId).exec();
      if (!candidate || !candidate.userId) return;

      const expirationDateFormatted = new Date(offer.expirationDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      await this.notificationsService.notifyCandidateOfferSent(
        candidate.userId.toString(),
        {
          jobTitle: offer.positionTitle,
          offerId: offer._id.toString(),
          expirationDateFormatted,
        },
      );
    } catch (err) {
      this.logger.error('Lỗi khi gửi thông báo Offer cho ứng viên:', err);
    }
  }
}
