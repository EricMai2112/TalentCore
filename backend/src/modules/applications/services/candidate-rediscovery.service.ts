import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CandidateInvitation,
  CandidateInvitationDocument,
  InvitationStatus,
} from '../schemas/candidate-invitation.schema';
import { Application, ApplicationDocument, ApplicationStatus } from '../schemas/application.schema';
import { AiEvaluation, AiEvaluationDocument } from '../schemas/ai-evaluation.schema';
import { Candidate, CandidateDocument } from '../../candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionDocument, JobStatus } from '../../job-description/schemas/job-description.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { EmailService } from '../../email-template/services/email.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '../../notifications/schemas/notification.schema';
import { ApplicationService } from './application.service';
import { InviteCandidateDto, RespondInvitationDto, InvitationAction } from '../dtos/candidate-invitation.dto';

import {
  InterviewEvaluation,
  InterviewEvaluationDocument,
  RecommendationType,
} from '../../interviews/schemas/interview-evaluation.schema';
import { Offer, OfferDocument, OfferStatus } from '../../offers/schemas/offer.schema';
import {
  PipelineTemplate,
  PipelineTemplateDocument,
  StageType,
} from '../../pipeline-template/schemas/pipeline-template.schema';

export enum CandidateRediscoveryTier {
  OFFER = 'OFFER',
  INTERVIEW = 'INTERVIEW',
}

export interface RecommendedCandidateResult {
  candidateId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  headline?: string;
  avatar?: string;
  skills: Array<{ name: string; proficiency?: string; yearsOfExperience?: number }>;
  previousJobTitle: string;
  previousJobId: string;
  previousApplicationId: string;
  previousAiFitScore: number;
  evidenceStrengthScore?: number;
  keyStrengths: string[];
  appliedAt: Date;
  tier: CandidateRediscoveryTier;
  stageBadgeTitle: string;
  interviewScore?: number;
  interviewRecommendation?: string;
  interviewRecommendationLabel?: string;
  invitation?: {
    _id: string;
    status: InvitationStatus;
    expiresAt: Date;
    createdAt: Date;
    note?: string;
  } | null;
}

@Injectable()
export class CandidateRediscoveryService {
  private readonly logger = new Logger(CandidateRediscoveryService.name);

  constructor(
    @InjectModel(CandidateInvitation.name)
    private readonly invitationModel: Model<CandidateInvitationDocument>,

    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,

    @InjectModel(AiEvaluation.name)
    private readonly aiEvaluationModel: Model<AiEvaluationDocument>,

    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,

    @InjectModel(JobDescription.name)
    private readonly jobModel: Model<JobDescriptionDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(InterviewEvaluation.name)
    private readonly interviewEvaluationModel: Model<InterviewEvaluationDocument>,

    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,

    @InjectModel(PipelineTemplate.name)
    private readonly pipelineModel: Model<PipelineTemplateDocument>,

    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly applicationService: ApplicationService,
  ) {}

  /**
   * Quét cơ sở dữ liệu và gợi ý ứng viên tiềm năng (Silver Medalists) cho một JD cụ thể.
   */
  async getRecommendedCandidates(jobDescriptionId: string): Promise<RecommendedCandidateResult[]> {
    const targetJob = await this.jobModel.findById(jobDescriptionId).exec();
    if (!targetJob) {
      throw new NotFoundException('Tin tuyển dụng không tồn tại.');
    }

    const targetJobObjId = new Types.ObjectId(jobDescriptionId);

    // 1. Danh sách candidateId đã có đơn nộp trong chính JD này
    const existingApps = await this.applicationModel
      .find({ jobDescriptionId: targetJobObjId })
      .select('candidateId')
      .exec();
    const existingCandidateIdSet = new Set(existingApps.map((a) => a.candidateId.toString()));

    // 2. Danh sách candidateId đã được tuyển dụng (HIRED) ở bất kỳ JD nào
    const hiredApps = await this.applicationModel
      .find({ status: ApplicationStatus.HIRED })
      .select('candidateId')
      .exec();
    const hiredCandidateIdSet = new Set(hiredApps.map((a) => a.candidateId.toString()));

    // 3. Tìm các JD cùng vị trí thuộc cùng phòng ban (Ràng buộc cứng: Cùng departmentId và Cùng positionId/title)
    if (!targetJob.departmentId) {
      return [];
    }

    const escapeRegex = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const cleanTitle = (targetJob.title || '').trim();

    const matchJdQuery: any = {
      _id: { $ne: targetJobObjId },
      departmentId: targetJob.departmentId, // BẮT BUỘC: Chỉ lấy trong cùng phòng ban
    };

    if (targetJob.positionId) {
      matchJdQuery.$or = [
        { positionId: targetJob.positionId },
        ...(cleanTitle ? [{ title: { $regex: new RegExp(`^${escapeRegex(cleanTitle)}$`, 'i') } }] : []),
      ];
    } else if (cleanTitle) {
      matchJdQuery.title = { $regex: new RegExp(`^${escapeRegex(cleanTitle)}$`, 'i') };
    }

    const relatedJobs = await this.jobModel.find(matchJdQuery).select('_id title').exec();
    const relatedJobIds = relatedJobs.map((j) => j._id);
    const relatedJobMap = new Map(relatedJobs.map((j) => [j._id.toString(), j.title]));

    if (relatedJobIds.length === 0) {
      return [];
    }

    const appQuery: any = {
      jobDescriptionId: { $in: relatedJobIds },
      status: { $ne: ApplicationStatus.HIRED },
    };

    const pastApplications = await this.applicationModel
      .find(appQuery)
      .populate('jobDescriptionId', 'title')
      .select('_id candidateId jobDescriptionId appliedAt updatedAt')
      .exec();

    if (pastApplications.length === 0) {
      return [];
    }

    const appIds = pastApplications.map((a) => a._id);

    // 4. Lấy AI Evaluations của các applications này
    const aiEvals = await this.aiEvaluationModel
      .find({
        applicationId: { $in: appIds },
        isMissingMandatory: { $ne: true },
      })
      .select('applicationId aiFitScore evidenceStrengthScore keyStrengths summary')
      .exec();
    const evalMap = new Map(aiEvals.map((e) => [e.applicationId.toString(), e]));

    // 5. Lấy danh sách Offer trong quá khứ của các applications này
    const pastOffers = await this.offerModel
      .find({
        applicationId: { $in: appIds },
        status: { $ne: OfferStatus.CANCELLED },
      })
      .select('applicationId status createdAt')
      .exec();
    const offerMap = new Map(pastOffers.map((o) => [o.applicationId.toString(), o]));

    // 6. Lấy danh sách InterviewEvaluation chính thức (isDraft: false)
    const interviewEvals = await this.interviewEvaluationModel
      .find({
        applicationId: { $in: appIds },
        isDraft: false,
      })
      .select('applicationId overallScore recommendation createdAt generalFeedback')
      .sort({ createdAt: -1 })
      .exec();

    // Nhóm đánh giá phỏng vấn theo applicationId
    const appEvaluationsMap = new Map<string, InterviewEvaluationDocument[]>();
    for (const ev of interviewEvals) {
      const appIdStr = ev.applicationId.toString();
      if (!appEvaluationsMap.has(appIdStr)) {
        appEvaluationsMap.set(appIdStr, []);
      }
      appEvaluationsMap.get(appIdStr)!.push(ev);
    }

    // 7. Sàng lọc ứng viên đạt chuẩn Á quân (Silver Medalists Filter) & Gom nhóm theo candidateId
    interface QualifyingCandidateMatch {
      application: any;
      evalData?: AiEvaluationDocument;
      tier: CandidateRediscoveryTier;
      stageBadgeTitle: string;
      interviewScore?: number;
      interviewRecommendation?: string;
      interviewRecommendationLabel?: string;
    }

    const candidateBestMatch = new Map<string, QualifyingCandidateMatch>();

    for (const app of pastApplications) {
      const cIdStr = app.candidateId.toString();
      if (existingCandidateIdSet.has(cIdStr) || hiredCandidateIdSet.has(cIdStr)) {
        continue;
      }

      const appIdStr = app._id.toString();
      const evals = appEvaluationsMap.get(appIdStr) || [];

      // 7.1 Veto Rule: Nếu có bất kỳ đánh giá nào là NO_HIRE, loại bỏ hoàn toàn
      const hasNoHire = evals.some((e) => e.recommendation === RecommendationType.NO_HIRE);
      if (hasNoHire) {
        continue;
      }

      const hasOffer = offerMap.has(appIdStr);

      // 7.2 Tính điểm phỏng vấn và kiểm tra Recommendation
      let hasStrongHire = false;
      let hasHire = false;
      let totalScore = 0;

      for (const ev of evals) {
        totalScore += ev.overallScore || 0;
        if (ev.recommendation === RecommendationType.STRONG_HIRE) hasStrongHire = true;
        if (ev.recommendation === RecommendationType.HIRE) hasHire = true;
      }

      const avgScore = evals.length > 0 ? Number((totalScore / evals.length).toFixed(1)) : 0;

      let tier: CandidateRediscoveryTier | null = null;
      let stageBadgeTitle = '';
      let interviewRecommendation = '';
      let interviewRecommendationLabel = '';

      if (hasOffer) {
        // TIER 1: Từng nhận Offer
        tier = CandidateRediscoveryTier.OFFER;
        stageBadgeTitle = 'Từng nhận Offer';
        if (evals.length > 0) {
          if (hasStrongHire) {
            interviewRecommendation = RecommendationType.STRONG_HIRE;
            interviewRecommendationLabel = 'Đề xuất nhận ngay';
          } else if (hasHire) {
            interviewRecommendation = RecommendationType.HIRE;
            interviewRecommendationLabel = 'Đồng ý nhận';
          }
        }
      } else if (evals.length > 0) {
        // TIER 2: Vượt qua Phỏng vấn (Smart Threshold)
        // Quy tắc:
        // - STRONG_HIRE: Điểm >= 3.0
        // - HIRE: Điểm >= 3.5
        // - CONSIDER hoặc điểm thấp: Bị loại
        if (hasStrongHire && avgScore >= 3.0) {
          tier = CandidateRediscoveryTier.INTERVIEW;
          stageBadgeTitle = 'Phỏng vấn xuất sắc';
          interviewRecommendation = RecommendationType.STRONG_HIRE;
          interviewRecommendationLabel = 'Đề xuất nhận ngay';
        } else if (hasHire && avgScore >= 3.5) {
          tier = CandidateRediscoveryTier.INTERVIEW;
          stageBadgeTitle = 'Phỏng vấn tốt';
          interviewRecommendation = RecommendationType.HIRE;
          interviewRecommendationLabel = 'Đồng ý nhận';
        }
      }

      // Nếu không đạt chuẩn Á quân ở cả Offer lẫn Interview -> Bỏ qua
      if (!tier) {
        continue;
      }

      const evalData = evalMap.get(appIdStr);
      const currentCandidateMatch: QualifyingCandidateMatch = {
        application: app,
        evalData,
        tier,
        stageBadgeTitle,
        interviewScore: avgScore > 0 ? avgScore : undefined,
        interviewRecommendation: interviewRecommendation || undefined,
        interviewRecommendationLabel: interviewRecommendationLabel || undefined,
      };

      const existingBest = candidateBestMatch.get(cIdStr);
      if (!existingBest) {
        candidateBestMatch.set(cIdStr, currentCandidateMatch);
      } else {
        // So sánh để chọn application tốt nhất của candidate này
        // 1. OFFER ưu tiên hơn INTERVIEW
        if (existingBest.tier !== currentCandidateMatch.tier) {
          if (currentCandidateMatch.tier === CandidateRediscoveryTier.OFFER) {
            candidateBestMatch.set(cIdStr, currentCandidateMatch);
          }
        } else {
          // Cùng tier: So sánh điểm phỏng vấn, sau đó điểm AI
          const scoreCurrent = currentCandidateMatch.interviewScore || 0;
          const scoreExisting = existingBest.interviewScore || 0;
          if (scoreCurrent > scoreExisting) {
            candidateBestMatch.set(cIdStr, currentCandidateMatch);
          } else if (scoreCurrent === scoreExisting) {
            const aiCurrent = currentCandidateMatch.evalData?.aiFitScore || 0;
            const aiExisting = existingBest.evalData?.aiFitScore || 0;
            if (aiCurrent > aiExisting) {
              candidateBestMatch.set(cIdStr, currentCandidateMatch);
            }
          }
        }
      }
    }

    const candidateIds = Array.from(candidateBestMatch.keys()).map((id) => new Types.ObjectId(id));
    if (candidateIds.length === 0) {
      return [];
    }

    // 8. Truy vấn hồ sơ Candidate và User
    const candidates = await this.candidateModel
      .find({ _id: { $in: candidateIds } })
      .populate('userId', 'name email phone avatar')
      .exec();

    // 9. Truy vấn lịch sử lời mời (CandidateInvitation) cho JD hiện tại
    const invitations = await this.invitationModel
      .find({
        jobDescriptionId: targetJobObjId,
        candidateId: { $in: candidateIds },
      })
      .exec();

    const now = new Date();
    const invitationMap = new Map<string, any>();
    for (const inv of invitations) {
      if (inv.status === InvitationStatus.PENDING && inv.expiresAt < now) {
        inv.status = InvitationStatus.EXPIRED;
        await inv.save();
      }
      invitationMap.set(inv.candidateId.toString(), inv);
    }

    // 10. Tổng hợp kết quả trả về
    const results: RecommendedCandidateResult[] = [];

    for (const cand of candidates) {
      const cIdStr = cand._id.toString();
      const match = candidateBestMatch.get(cIdStr);
      if (!match) continue;

      const userObj: any = cand.userId || {};
      const jobObj: any = match.application.jobDescriptionId || {};
      const inv = invitationMap.get(cIdStr);

      results.push({
        candidateId: cIdStr,
        userId: userObj._id ? userObj._id.toString() : '',
        name: userObj.name || cand.profileName || 'Ứng viên',
        email: userObj.email || '',
        phone: userObj.phone || '',
        headline: cand.headline || '',
        avatar: userObj.avatar || '',
        skills: (cand.skills || []).map((s: any) => ({
          name: s.name,
          proficiency: s.proficiency,
          yearsOfExperience: s.yearsOfExperience,
        })),
        previousJobTitle: jobObj.title || relatedJobMap.get(match.application.jobDescriptionId?.toString()) || 'Vị trí trước đây',
        previousJobId: match.application.jobDescriptionId?._id?.toString() || match.application.jobDescriptionId?.toString(),
        previousApplicationId: match.application._id.toString(),
        previousAiFitScore: match.evalData?.aiFitScore || 0,
        evidenceStrengthScore: match.evalData?.evidenceStrengthScore,
        keyStrengths: match.evalData?.keyStrengths || [],
        appliedAt: match.application.appliedAt,
        tier: match.tier,
        stageBadgeTitle: match.stageBadgeTitle,
        interviewScore: match.interviewScore,
        interviewRecommendation: match.interviewRecommendation,
        interviewRecommendationLabel: match.interviewRecommendationLabel,
        invitation: inv
          ? {
              _id: inv._id.toString(),
              status: inv.status,
              expiresAt: inv.expiresAt,
              createdAt: inv.createdAt,
              note: inv.note,
            }
          : null,
      });
    }

    // 11. Thuật toán sắp xếp đa tầng:
    // 1. Chưa mời lên đầu
    // 2. TIER 1 (OFFER) trước TIER 2 (INTERVIEW)
    // 3. STRONG_HIRE trước HIRE
    // 4. Điểm phỏng vấn cao hơn lên trước
    // 5. Điểm AI Match cao hơn lên trước
    results.sort((a, b) => {
      const hasInvA = a.invitation ? 1 : 0;
      const hasInvB = b.invitation ? 1 : 0;
      if (hasInvA !== hasInvB) return hasInvA - hasInvB;

      if (a.tier !== b.tier) {
        return a.tier === CandidateRediscoveryTier.OFFER ? -1 : 1;
      }

      if (a.tier === CandidateRediscoveryTier.INTERVIEW) {
        const recWeightA = a.interviewRecommendation === RecommendationType.STRONG_HIRE ? 2 : (a.interviewRecommendation === RecommendationType.HIRE ? 1 : 0);
        const recWeightB = b.interviewRecommendation === RecommendationType.STRONG_HIRE ? 2 : (b.interviewRecommendation === RecommendationType.HIRE ? 1 : 0);
        if (recWeightA !== recWeightB) return recWeightB - recWeightA;
      }

      const scoreA = a.interviewScore || 0;
      const scoreB = b.interviewScore || 0;
      if (Math.abs(scoreB - scoreA) > 0.05) {
        return scoreB - scoreA;
      }

      return b.previousAiFitScore - a.previousAiFitScore;
    });

    return results;
  }

  /**
   * HR gửi lời mời tái ứng tuyển tới ứng viên.
   */
  async inviteCandidate(dto: InviteCandidateDto, hrUserId: string): Promise<any> {
    const targetJob = await this.jobModel
      .findById(dto.jobDescriptionId)
      .populate('departmentId', 'name')
      .exec();

    if (!targetJob) {
      throw new NotFoundException('Tin tuyển dụng không tồn tại.');
    }

    if (targetJob.status !== JobStatus.JD_CREATED) {
      throw new BadRequestException('Tin tuyển dụng hiện không ở trạng thái mở tiếp nhận.');
    }

    const candidate = await this.candidateModel
      .findById(dto.candidateId)
      .populate('userId', 'name email phone avatar')
      .exec();

    if (!candidate) {
      throw new NotFoundException('Hồ sơ ứng viên không tồn tại.');
    }

    const userObj: any = candidate.userId;
    if (!userObj || !userObj._id) {
      throw new BadRequestException('Hồ sơ ứng viên không liên kết với tài khoản người dùng hợp lệ.');
    }

    // Kiểm tra xem ứng viên đã apply vào JD này chưa
    const existingApp = await this.applicationModel.findOne({
      candidateId: candidate._id,
      jobDescriptionId: targetJob._id,
    });
    if (existingApp) {
      throw new BadRequestException('Ứng viên này đã nộp hồ sơ vào vị trí này rồi.');
    }

    // Kiểm tra xem đã có lời mời PENDING nào chưa
    const existingInv = await this.invitationModel.findOne({
      jobDescriptionId: targetJob._id,
      candidateId: candidate._id,
      status: InvitationStatus.PENDING,
    });

    if (existingInv) {
      if (existingInv.expiresAt > new Date()) {
        throw new BadRequestException('Đã gửi lời mời cho ứng viên này và đang chờ phản hồi.');
      } else {
        existingInv.status = InvitationStatus.EXPIRED;
        await existingInv.save();
      }
    }

    // Tính toán thời hạn lời mời (mặc định 7 ngày, tối đa tới deadline của JD)
    const expireDays = dto.expireDays || 7;
    let expiresAt = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);
    if (targetJob.applicationDeadline) {
      const deadline = new Date(targetJob.applicationDeadline);
      if (deadline < expiresAt && deadline > new Date()) {
        expiresAt = deadline;
      }
    }

    // Tìm điểm AI và đơn nộp cũ nhất gần đây
    const prevApp = await this.applicationModel
      .findOne({ candidateId: candidate._id, jobDescriptionId: { $ne: targetJob._id } })
      .sort({ updatedAt: -1 })
      .exec();

    let prevAiFitScore = 0;
    if (prevApp) {
      const prevEval = await this.aiEvaluationModel.findOne({ applicationId: prevApp._id }).exec();
      if (prevEval) prevAiFitScore = prevEval.aiFitScore;
    }

    const newInvitation = await this.invitationModel.create({
      jobDescriptionId: targetJob._id,
      candidateId: candidate._id,
      userId: userObj._id,
      invitedById: new Types.ObjectId(hrUserId),
      status: InvitationStatus.PENDING,
      previousApplicationId: prevApp?._id,
      previousAiFitScore: prevAiFitScore,
      note: dto.note || '',
      expiresAt,
    });

    const deptName = typeof targetJob.departmentId === 'object' ? (targetJob.departmentId as any)?.name : '';
    const salaryText = `${targetJob.minimumSalary?.toLocaleString('vi-VN')} - ${targetJob.maximumSalary?.toLocaleString('vi-VN')} VNĐ`;
    const formattedExpiresDate = expiresAt.toLocaleDateString('vi-VN');

    // 1. Gửi Email thông báo tới ứng viên
    try {
      await this.emailService.sendReEngagementInvitationEmail({
        toEmail: userObj.email,
        candidateName: userObj.name || candidate.profileName || 'Bạn',
        jobTitle: targetJob.title,
        departmentName: deptName,
        salaryRange: salaryText,
        customNote: dto.note,
        expiresAtDate: formattedExpiresDate,
      });
    } catch (mailErr: any) {
      this.logger.error(`[CandidateRediscovery] Lỗi gửi email lời mời: ${mailErr?.message || mailErr}`);
    }

    // 2. Gửi thông báo thời gian thực In-App tới ứng viên
    try {
      await this.notificationsService.create({
        recipientId: userObj._id.toString(),
        senderId: hrUserId,
        title: `Lời mời cơ hội việc làm: ${targetJob.title}`,
        message: `Ban tuyển dụng trân trọng mời bạn tham gia ứng tuyển lại vị trí ${targetJob.title}. Lời mời có hiệu lực đến ngày ${formattedExpiresDate}.`,
        type: NotificationType.RE_ENGAGEMENT_INVITE,
        category: NotificationCategory.CANDIDATE,
        priority: NotificationPriority.HIGH,
        actionUrl: `/user/applications?invitationId=${newInvitation._id}`,
        metadata: {
          invitationId: newInvitation._id.toString(),
          jobDescriptionId: targetJob._id.toString(),
          jobTitle: targetJob.title,
          expiresAt: expiresAt.toISOString(),
        },
      });
    } catch (notifErr: any) {
      this.logger.error(`[CandidateRediscovery] Lỗi tạo thông báo lời mời: ${notifErr?.message || notifErr}`);
    }

    return newInvitation;
  }

  /**
   * Ứng viên lấy danh sách lời mời của mình (đang chờ và lịch sử).
   */
  async getMyInvitations(userId: string): Promise<any[]> {
    const userObjId = new Types.ObjectId(userId);
    const invitations = await this.invitationModel
      .find({ userId: userObjId })
      .populate({
        path: 'jobDescriptionId',
        select: 'title location employmentType minimumSalary maximumSalary departmentId status applicationDeadline description requirements benefits',
        populate: { path: 'departmentId', select: 'name code' },
      })
      .populate('invitedById', 'name email role')
      .sort({ createdAt: -1 })
      .exec();

    const now = new Date();
    // Tự động kiểm tra quá hạn
    for (const inv of invitations) {
      if (inv.status === InvitationStatus.PENDING && inv.expiresAt < now) {
        inv.status = InvitationStatus.EXPIRED;
        await inv.save();
      }
    }

    return invitations;
  }

  /**
   * Ứng viên phản hồi lời mời: Chấp nhận (1-Click Apply) hoặc Từ chối khéo.
   */
  async respondInvitation(
    invitationId: string,
    userId: string,
    dto: RespondInvitationDto,
  ): Promise<any> {
    const invitation = await this.invitationModel
      .findById(invitationId)
      .populate('jobDescriptionId', 'title status applicationDeadline')
      .populate('candidateId', 'profileName')
      .exec();

    if (!invitation) {
      throw new NotFoundException('Lời mời không tồn tại.');
    }

    if (invitation.userId.toString() !== userId) {
      throw new BadRequestException('Bạn không có quyền thao tác trên lời mời này.');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Lời mời này đã được phản hồi hoặc đã hết hiệu lực.');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      await invitation.save();
      throw new BadRequestException('Rất tiếc, lời mời này đã hết hạn phản hồi.');
    }

    const targetJob: any = invitation.jobDescriptionId;
    if (!targetJob || targetJob.status !== JobStatus.JD_CREATED) {
      throw new BadRequestException('Vị trí tuyển dụng này hiện đã đóng hoặc không còn nhận hồ sơ.');
    }

    const candidateUser = await this.userModel.findById(userId).select('name email').exec();
    const candidateName = candidateUser?.name || 'Ứng viên';

    if (dto.action === InvitationAction.ACCEPT) {
      // 1. Tự động nộp đơn ứng tuyển cho ứng viên (1-Click Apply)
      const newApp = await this.applicationService.applyJob(
        userId,
        invitation.jobDescriptionId._id.toString(),
        invitation.candidateId._id.toString(),
      );

      const createdAppId = newApp?.applicationId;

      // 2. Chuyển thẳng hồ sơ vào vòng DEPARTMENT REVIEW (Đặc cách miễn vòng lọc ban đầu)
      if (createdAppId) {
        try {
          const fullJob = await this.jobModel.findById(invitation.jobDescriptionId._id).exec();
          if (fullJob?.pipelineTemplateId) {
            const pipeline = await this.pipelineModel.findById(fullJob.pipelineTemplateId).exec();
            if (pipeline?.stages?.length) {
              const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order);
              const deptStage = sortedStages.find((s) => {
                const sType = s.stageType;
                const sNameLower = (s.name || '').toLowerCase();
                return (
                  sType === StageType.DEPARTMENT_REVIEW ||
                  sType === StageType.INTERVIEW ||
                  sNameLower.includes('department') ||
                  sNameLower.includes('trưởng phòng') ||
                  sNameLower.includes('chuyên môn') ||
                  sNameLower.includes('phỏng vấn')
                );
              }) || (sortedStages.length > 1 ? sortedStages[1] : null);

              if (deptStage) {
                await this.applicationService.updateApplicationStage(
                  createdAppId.toString(),
                  deptStage._id.toString(),
                );
                this.logger.log(
                  `[CandidateRediscovery] Đã đặc cách chuyển đơn ${createdAppId} vào vòng: ${deptStage.name}`,
                );
              }
            }
          }
        } catch (stageErr: any) {
          this.logger.error(
            `[CandidateRediscovery] Lỗi khi chuyển thẳng sang DEPARTMENT REVIEW: ${stageErr?.message || stageErr}`,
          );
        }

        // 3. Giữ lại phần Tổng quan AI từ đợt ứng tuyển trước, làm mới tab Đánh giá phỏng vấn
        try {
          let prevEval: AiEvaluationDocument | null = null;
          if (invitation.previousApplicationId) {
            prevEval = await this.aiEvaluationModel
              .findOne({ applicationId: invitation.previousApplicationId })
              .exec();
          }

          if (!prevEval) {
            const prevApp = await this.applicationModel
              .findOne({
                candidateId: invitation.candidateId._id,
                _id: { $ne: createdAppId },
              })
              .sort({ updatedAt: -1 })
              .exec();

            if (prevApp) {
              prevEval = await this.aiEvaluationModel
                .findOne({ applicationId: prevApp._id })
                .exec();
            }
          }

          if (prevEval) {
            await this.aiEvaluationModel.findOneAndUpdate(
              { applicationId: createdAppId },
              {
                applicationId: createdAppId,
                aiFitScore: prevEval.aiFitScore,
                evidenceStrengthScore: prevEval.evidenceStrengthScore || 0,
                isMissingMandatory: Boolean(prevEval.isMissingMandatory),
                warnings: prevEval.warnings || [],
                summary: prevEval.summary || '',
                keyStrengths: prevEval.keyStrengths || [],
                potentialGaps: prevEval.potentialGaps || [],
                suggestedQuestions: prevEval.suggestedQuestions || [],
                evaluatedCriteria: prevEval.evaluatedCriteria || [],
                evaluatedAt: new Date(),
              },
              { upsert: true, returnDocument: 'after' },
            );

            await this.applicationModel.findByIdAndUpdate(createdAppId, {
              aiFitScore: prevEval.aiFitScore,
            });

            this.logger.log(
              `[CandidateRediscovery] Đã kế thừa thành công kết quả Tổng quan AI (${prevEval.aiFitScore}%) cho đơn mới ${createdAppId}`,
            );
          }
        } catch (copyAiErr: any) {
          this.logger.error(
            `[CandidateRediscovery] Lỗi kế thừa đánh giá AI: ${copyAiErr?.message || copyAiErr}`,
          );
        }
      }

      invitation.status = InvitationStatus.ACCEPTED;
      invitation.respondedAt = new Date();
      invitation.acceptedApplicationId = createdAppId;
      await invitation.save();

      // 2. Gửi thông báo cho HR
      try {
        await this.notificationsService.create({
          recipientId: invitation.invitedById.toString(),
          senderId: userId,
          title: `Ứng viên đã chấp nhận lời mời ứng tuyển`,
          message: `${candidateName} đã đồng ý tham gia đợt tuyển dụng cho vị trí "${targetJob.title}" (1-Click Apply).`,
          type: NotificationType.INVITATION_ACCEPTED,
          category: NotificationCategory.CANDIDATE,
          priority: NotificationPriority.HIGH,
          actionUrl: `/candidates?jobId=${targetJob._id}`,
          metadata: {
            invitationId: invitation._id.toString(),
            jobDescriptionId: targetJob._id.toString(),
            candidateId: invitation.candidateId._id.toString(),
          },
        });
      } catch (err: any) {
        this.logger.error(`[CandidateRediscovery] Lỗi thông báo HR: ${err?.message || err}`);
      }

      return {
        message: 'Bạn đã chấp nhận lời mời và ứng tuyển thành công!',
        invitation,
        application: newApp,
      };
    } else {
      // Từ chối lời mời
      invitation.status = InvitationStatus.DECLINED;
      invitation.respondedAt = new Date();
      invitation.declineReason = dto.declineReason || 'Ứng viên từ chối tham gia đợt này';
      await invitation.save();

      // Gửi thông báo cho HR
      try {
        await this.notificationsService.create({
          recipientId: invitation.invitedById.toString(),
          senderId: userId,
          title: `Ứng viên đã từ chối lời mời ứng tuyển`,
          message: `${candidateName} đã từ chối lời mời vị trí "${targetJob.title}".${dto.declineReason ? ` Lý do: ${dto.declineReason}` : ''}`,
          type: NotificationType.INVITATION_DECLINED,
          category: NotificationCategory.CANDIDATE,
          priority: NotificationPriority.LOW,
          actionUrl: `/job-description/${targetJob._id}`,
          metadata: {
            invitationId: invitation._id.toString(),
            jobDescriptionId: targetJob._id.toString(),
          },
        });
      } catch (err: any) {
        this.logger.error(`[CandidateRediscovery] Lỗi thông báo HR: ${err?.message || err}`);
      }

      return {
        message: 'Bạn đã từ chối lời mời ứng tuyển.',
        invitation,
      };
    }
  }
}
