import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '../schemas/notification.schema';
import { User, UserDocument, UserRole, UserStatus } from '../../users/schemas/user.schema';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { QueryNotificationDto } from '../dtos/query-notification.dto';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // Tạo 1 thông báo và đẩy thời gian thực qua WebSockets
  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    const newNotification = new this.notificationModel({
      recipientId: new Types.ObjectId(dto.recipientId),
      senderId: dto.senderId ? new Types.ObjectId(dto.senderId) : null,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      category: dto.category || NotificationCategory.RECRUITMENT,
      priority: dto.priority || NotificationPriority.MEDIUM,
      actionUrl: dto.actionUrl || '',
      metadata: dto.metadata || {},
      isRead: false,
    });

    const saved = await newNotification.save();

    this.notificationsGateway.sendToUser(dto.recipientId, saved);

    const unreadCount = await this.getUnreadCount(dto.recipientId);
    this.notificationsGateway.emitUnreadCount(dto.recipientId, unreadCount);

    return saved;
  }


  async notifyHrAdmins(data: {
    title: string;
    message: string;
    type: NotificationType;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    actionUrl?: string;
    metadata?: Record<string, any>;
    senderId?: string;
  }) {
    try {
      const hrAdmins = await this.userModel.find({
        role: UserRole.HR_ADMIN,
        status: UserStatus.ACTIVE,
      }).exec();

      if (!hrAdmins || hrAdmins.length === 0) {
        this.logger.warn('Không tìm thấy tài khoản HR Admin nào để gửi thông báo.');
        return [];
      }

      const promises = hrAdmins.map((admin) =>
        this.create({
          recipientId: admin._id.toString(),
          senderId: data.senderId,
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category || NotificationCategory.RECRUITMENT,
          priority: data.priority || NotificationPriority.HIGH,
          actionUrl: data.actionUrl,
          metadata: data.metadata,
        }),
      );

      return await Promise.all(promises);
    } catch (err) {
      this.logger.error('Lỗi khi gửi thông báo đến HR Admins:', err);
      return [];
    }
  }

  private extractDeptId(rawDept: any): string | undefined {
    if (!rawDept) return undefined;
    if (rawDept._id) return rawDept._id.toString();
    return rawDept.toString();
  }

  async notifyDepartmentManagers(
    departmentId: string,
    data: {
      title: string;
      message: string;
      type: NotificationType;
      category?: NotificationCategory;
      priority?: NotificationPriority;
      actionUrl?: string;
      metadata?: Record<string, any>;
      senderId?: string;
    },
  ) {
    try {
      const filter: any = {
        role: UserRole.DEPARTMENT_MANAGER,
        status: UserStatus.ACTIVE,
      };

      if (departmentId && Types.ObjectId.isValid(departmentId)) {
        filter.$or = [
          { departmentId: new Types.ObjectId(departmentId) },
          { departmentId: departmentId },
        ];
      }

      let managers = await this.userModel.find(filter).exec();

      // Fallback: nếu không tìm thấy trưởng phòng cụ thể của phòng ban này,
      // gửi cho bất kỳ Trưởng phòng nào đang hoạt động trong hệ thống
      if (!managers || managers.length === 0) {
        this.logger.warn(
          `Không tìm thấy Trưởng phòng cụ thể cho phòng ban ${departmentId}. Thử tìm Trưởng phòng bất kỳ đang hoạt động...`,
        );
        managers = await this.userModel.find({
          role: UserRole.DEPARTMENT_MANAGER,
          status: UserStatus.ACTIVE,
        }).exec();
      }

      if (!managers || managers.length === 0) {
        this.logger.warn(`Không tìm thấy tài khoản Trưởng phòng ban (DEPARTMENT_MANAGER) nào hoạt động.`);
        return [];
      }

      const promises = managers.map((mgr) =>
        this.create({
          recipientId: mgr._id.toString(),
          senderId: data.senderId,
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category || NotificationCategory.RECRUITMENT,
          priority: data.priority || NotificationPriority.HIGH,
          actionUrl: data.actionUrl,
          metadata: data.metadata,
        }),
      );

      return await Promise.all(promises);
    } catch (err) {
      this.logger.error(`Lỗi khi gửi thông báo đến Trưởng phòng ban ${departmentId}:`, err);
      return [];
    }
  }

  async notifyHrJdCreatedPending(job: any, departmentName?: string, creatorName?: string) {
    const deptStr = departmentName ? `thuộc phòng ban ${departmentName}` : '';
    const creatorStr = creatorName ? ` bởi ${creatorName}` : '';

    return this.notifyHrAdmins({
      title: 'Yêu cầu tuyển dụng mới chờ duyệt',
      message: `Trưởng phòng vừa tạo yêu cầu tuyển dụng cho vị trí "${job.title}" ${deptStr}${creatorStr}. Vui lòng xem xét và duyệt JD.`,
      type: NotificationType.JD_CREATED_PENDING,
      category: NotificationCategory.RECRUITMENT,
      priority: NotificationPriority.HIGH,
      actionUrl: '/job-description',
      metadata: {
        jobId: job._id?.toString(),
        jobTitle: job.title,
        departmentId: this.extractDeptId(job.departmentId),
        departmentName,
      },
    });
  }

  async notifyDepartmentReview(params: {
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    departmentId: string;
    stageName?: string;
  }) {
    const { applicationId, candidateName, jobTitle, departmentId, stageName } = params;

    return this.notifyDepartmentManagers(departmentId, {
      title: 'Ứng viên chuyển sang vòng Đánh giá phòng ban',
      message: `Ứng viên ${candidateName} ứng tuyển vị trí "${jobTitle}" đã được chuyển sang giai đoạn "${stageName || 'Đánh giá phòng ban'}". Vui lòng xem xét hồ sơ và đánh giá chuyên môn.`,
      type: NotificationType.STAGE_DEPARTMENT_REVIEW,
      category: NotificationCategory.RECRUITMENT,
      priority: NotificationPriority.HIGH,
      actionUrl: '/kanban',
      metadata: {
        applicationId,
        candidateName,
        jobTitle,
        departmentId,
        stageName,
      },
    });
  }

  async notifyJdApproved(job: any, approverName?: string) {
    const deptId = this.extractDeptId(job.departmentId);
    if (!deptId) return;

    const byStr = approverName ? ` bởi ${approverName}` : '';
    return this.notifyDepartmentManagers(deptId, {
      title: 'Yêu cầu tuyển dụng đã được phê duyệt',
      message: `Yêu cầu tuyển dụng cho vị trí "${job.title}" đã được phê duyệt${byStr}. Tin tuyển dụng đã sẵn sàng triển khai.`,
      type: NotificationType.JD_APPROVED,
      category: NotificationCategory.RECRUITMENT,
      priority: NotificationPriority.HIGH,
      actionUrl: '/job-description',
      metadata: {
        jobId: job._id?.toString(),
        jobTitle: job.title,
      },
    });
  }

  async notifyJdRejected(job: any, rejectorName?: string) {
    const deptId = this.extractDeptId(job.departmentId);
    if (!deptId) return;

    const byStr = rejectorName ? ` bởi ${rejectorName}` : '';
    return this.notifyDepartmentManagers(deptId, {
      title: 'Yêu cầu tuyển dụng bị từ chối',
      message: `Yêu cầu tuyển dụng cho vị trí "${job.title}" đã bị từ chối${byStr}. Vui lòng kiểm tra lại thông tin yêu cầu.`,
      type: NotificationType.JD_REJECTED,
      category: NotificationCategory.RECRUITMENT,
      priority: NotificationPriority.HIGH,
      actionUrl: '/job-description',
      metadata: {
        jobId: job._id?.toString(),
        jobTitle: job.title,
      },
    });
  }

  async notifyInterviewScheduled(
    interviewerId: string,
    params: {
      candidateName: string;
      jobTitle: string;
      dateFormatted: string;
      timeRange: string;
      interviewId: string;
    },
  ) {
    if (!interviewerId) return;

    return this.create({
      recipientId: interviewerId,
      title: 'Lịch phỏng vấn mới được phân công',
      message: `Bạn được phân công phỏng vấn ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") vào ngày ${params.dateFormatted} (${params.timeRange}).`,
      type: NotificationType.INTERVIEW_SCHEDULED,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.HIGH,
      actionUrl: '/interviews',
      metadata: {
        interviewId: params.interviewId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
      },
    });
  }

  async notifyDeptScheduleRequested(
    departmentId: string,
    params: {
      candidateName: string;
      jobTitle: string;
      applicationId: string;
      interviewId?: string;
    },
  ) {
    return this.notifyDepartmentManagers(departmentId, {
      title: 'Yêu cầu phòng ban lên lịch phỏng vấn',
      message: `HR yêu cầu phòng ban lên lịch phỏng vấn và chọn Người phỏng vấn cho ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}").`,
      type: NotificationType.INTERVIEW_REQUEST_DEPT_SCHEDULE,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.HIGH,
      actionUrl: '/interviews',
      metadata: {
        applicationId: params.applicationId,
        interviewId: params.interviewId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
      },
    });
  }

  async notifyInterviewSubmittedForApproval(params: {
    candidateName: string;
    jobTitle: string;
    dateFormatted: string;
    timeRange: string;
    interviewId: string;
  }) {
    return this.notifyHrAdmins({
      title: 'Đề xuất lịch phỏng vấn chờ duyệt',
      message: `Trưởng phòng đã đề xuất lịch phỏng vấn cho ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") vào lúc ${params.timeRange}, ngày ${params.dateFormatted}. Vui lòng kiểm tra và duyệt.`,
      type: NotificationType.INTERVIEW_DEPT_SUBMITTED,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.HIGH,
      actionUrl: '/interviews',
      metadata: {
        interviewId: params.interviewId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
      },
    });
  }

  async notifyInterviewApproved(params: {
    candidateName: string;
    jobTitle: string;
    dateFormatted: string;
    timeRange: string;
    interviewId: string;
    interviewerId?: string;
    departmentId?: string;
  }) {
    const promises: Promise<any>[] = [];

    // Báo Interviewer
    if (params.interviewerId) {
      promises.push(
        this.create({
          recipientId: params.interviewerId,
          title: 'Lịch phỏng vấn đã được phê duyệt',
          message: `Lịch phỏng vấn ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") vào lúc ${params.timeRange}, ngày ${params.dateFormatted} đã được duyệt chính thức.`,
          type: NotificationType.INTERVIEW_APPROVED,
          category: NotificationCategory.INTERVIEW,
          priority: NotificationPriority.HIGH,
          actionUrl: '/interviews',
          metadata: {
            interviewId: params.interviewId,
          },
        }),
      );
    }

    // Báo Trưởng phòng
    if (params.departmentId) {
      promises.push(
        this.notifyDepartmentManagers(params.departmentId, {
          title: 'Lịch phỏng vấn đã được HR phê duyệt',
          message: `Lịch phỏng vấn ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") vào lúc ${params.timeRange}, ngày ${params.dateFormatted} đã được HR duyệt.`,
          type: NotificationType.INTERVIEW_APPROVED,
          category: NotificationCategory.INTERVIEW,
          priority: NotificationPriority.MEDIUM,
          actionUrl: '/interviews',
          metadata: {
            interviewId: params.interviewId,
          },
        }),
      );
    }

    return Promise.all(promises);
  }

  async notifyInterviewCandidateResponse(params: {
    candidateName: string;
    jobTitle: string;
    statusText: string;
    interviewId: string;
    interviewerId?: string;
  }) {
    // Báo HR Admins
    await this.notifyHrAdmins({
      title: 'Phản hồi lịch phỏng vấn từ ứng viên',
      message: `Ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã ${params.statusText} lịch phỏng vấn.`,
      type: NotificationType.INTERVIEW_CONFIRMATION,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.HIGH,
      actionUrl: '/interviews',
      metadata: {
        interviewId: params.interviewId,
      },
    });

    // Báo Interviewer
    if (params.interviewerId) {
      await this.create({
        recipientId: params.interviewerId,
        title: 'Phản hồi lịch phỏng vấn từ ứng viên',
        message: `Ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã ${params.statusText} lịch phỏng vấn.`,
        type: NotificationType.INTERVIEW_CONFIRMATION,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.HIGH,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
        },
      });
    }
  }

  async notifyCandidateInterviewScheduled(
    candidateUserId: string,
    params: {
      jobTitle: string;
      dateFormatted: string;
      timeRange: string;
      interviewId: string;
    },
  ) {
    if (!candidateUserId) return;

    return this.create({
      recipientId: candidateUserId,
      title: 'Lịch phỏng vấn mới',
      message: `Bạn có buổi phỏng vấn cho vị trí "${params.jobTitle}" vào lúc ${params.timeRange}, ngày ${params.dateFormatted}. Vui lòng kiểm tra và xác nhận tham gia.`,
      type: NotificationType.INTERVIEW_SCHEDULED,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.HIGH,
      actionUrl: '/user/applications',
      metadata: {
        interviewId: params.interviewId,
        jobTitle: params.jobTitle,
      },
    });
  }

  async notifyCandidateInterviewRescheduled(
    candidateUserId: string,
    params: {
      jobTitle: string;
      dateFormatted: string;
      timeRange: string;
      interviewId: string;
    },
  ) {
    if (!candidateUserId) return;

    return this.create({
      recipientId: candidateUserId,
      title: 'Thay đổi thời gian phỏng vấn',
      message: `Lịch phỏng vấn vị trí "${params.jobTitle}" của bạn đã được cập nhật sang lúc ${params.timeRange}, ngày ${params.dateFormatted}. Vui lòng kiểm tra và xác nhận lại.`,
      type: NotificationType.INTERVIEW_RESCHEDULED,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.HIGH,
      actionUrl: '/user/applications',
      metadata: {
        interviewId: params.interviewId,
        jobTitle: params.jobTitle,
      },
    });
  }

  async notifyCandidateStageChanged(
    candidateUserId: string,
    params: {
      jobTitle: string;
      stageName: string;
      applicationId: string;
    },
  ) {
    if (!candidateUserId) return;

    return this.create({
      recipientId: candidateUserId,
      title: 'Cập nhật tiến trình tuyển dụng',
      message: `Chúc mừng bạn! Hồ sơ ứng tuyển vị trí "${params.jobTitle}" đã được chuyển sang giai đoạn: "${params.stageName}".`,
      type: NotificationType.STAGE_CHANGED,
      category: NotificationCategory.CANDIDATE,
      priority: NotificationPriority.HIGH,
      actionUrl: '/user/applications',
      metadata: {
        applicationId: params.applicationId,
        jobTitle: params.jobTitle,
        stageName: params.stageName,
      },
    });
  }

  async notifyCandidateOfferSent(
    candidateUserId: string,
    params: {
      jobTitle: string;
      offerId: string;
      expirationDateFormatted: string;
    },
  ) {
    if (!candidateUserId) return;

    return this.create({
      recipientId: candidateUserId,
      title: 'Bạn nhận được Lời mời nhận việc (Offer Letter)',
      message: `Chúc mừng bạn! Bạn đã nhận được lời mời nhận việc cho vị trí "${params.jobTitle}". Vui lòng xem chi tiết và phản hồi trước ngày ${params.expirationDateFormatted}.`,
      type: NotificationType.OFFER_SENT,
      category: NotificationCategory.OFFER,
      priority: NotificationPriority.HIGH,
      actionUrl: '/user/applications?tab=offers',
      metadata: {
        offerId: params.offerId,
        jobTitle: params.jobTitle,
      },
    });
  }

  async notifyHrOfferAccepted(params: {
    candidateName: string;
    jobTitle: string;
    offerId: string;
    departmentId?: string;
  }) {
    // Notify HR Admins
    await this.notifyHrAdmins({
      title: 'Ứng viên đã chấp nhận Offer!',
      message: `Ứng viên ${params.candidateName} đã đồng ý nhận việc cho vị trí "${params.jobTitle}".`,
      type: NotificationType.OFFER_ACCEPTED,
      category: NotificationCategory.OFFER,
      priority: NotificationPriority.HIGH,
      actionUrl: '/offers',
      metadata: {
        offerId: params.offerId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
      },
    });

    // Notify Department Manager if departmentId exists
    if (params.departmentId) {
      await this.notifyDepartmentManagers(params.departmentId, {
        title: 'Ứng viên đã chấp nhận Offer!',
        message: `Ứng viên ${params.candidateName} đã chấp nhận lời mời nhận việc vị trí "${params.jobTitle}".`,
        type: NotificationType.OFFER_ACCEPTED,
        category: NotificationCategory.OFFER,
        priority: NotificationPriority.HIGH,
        actionUrl: '/offers',
        metadata: {
          offerId: params.offerId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
        },
      });
    }
  }

  async notifyHrOfferDeclined(params: {
    candidateName: string;
    jobTitle: string;
    offerId: string;
    declineReason?: string;
    departmentId?: string;
  }) {
    const reasonText = params.declineReason ? ` Lý do: "${params.declineReason}"` : '';

    // Notify HR Admins
    await this.notifyHrAdmins({
      title: 'Ứng viên đã từ chối Offer',
      message: `Ứng viên ${params.candidateName} đã từ chối lời mời nhận việc cho vị trí "${params.jobTitle}".${reasonText}`,
      type: NotificationType.OFFER_DECLINED,
      category: NotificationCategory.OFFER,
      priority: NotificationPriority.HIGH,
      actionUrl: '/offers',
      metadata: {
        offerId: params.offerId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
        declineReason: params.declineReason,
      },
    });

    // Notify Department Manager if departmentId exists
    if (params.departmentId) {
      await this.notifyDepartmentManagers(params.departmentId, {
        title: 'Ứng viên đã từ chối Offer',
        message: `Ứng viên ${params.candidateName} đã từ chối lời mời nhận việc cho vị trí "${params.jobTitle}".${reasonText}`,
        type: NotificationType.OFFER_DECLINED,
        category: NotificationCategory.OFFER,
        priority: NotificationPriority.HIGH,
        actionUrl: '/offers',
        metadata: {
          offerId: params.offerId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
          declineReason: params.declineReason,
        },
      });
    }
  }

  /**
   * 1. Trưởng phòng từ chối hồ sơ ứng viên ở vòng Đánh giá phòng ban (Department Review)
   */
  async notifyDeptCvRejected(params: {
    candidateName: string;
    jobTitle: string;
    reason?: string;
    departmentId?: string;
    candidateUserId?: string;
    applicationId?: string;
  }) {
    const reasonText = params.reason ? ` Lý do: "${params.reason}".` : '';

    // Báo HR Admins
    await this.notifyHrAdmins({
      title: 'Trưởng phòng từ chối hồ sơ ứng viên',
      message: `Trưởng phòng ban đã từ chối hồ sơ của ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}").${reasonText}`,
      type: NotificationType.CANDIDATE_REJECTED,
      category: NotificationCategory.RECRUITMENT,
      priority: NotificationPriority.HIGH,
      actionUrl: '/kanban',
      metadata: {
        applicationId: params.applicationId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
        reason: params.reason,
      },
    });

    // Báo Ứng viên
    if (params.candidateUserId) {
      await this.create({
        recipientId: params.candidateUserId,
        title: 'Thông báo kết quả hồ sơ ứng tuyển',
        message: `Cảm ơn bạn đã ứng tuyển vị trí "${params.jobTitle}". Rất tiếc, hồ sơ của bạn chưa phù hợp với yêu cầu ở vòng đánh giá chuyên môn hiện tại.`,
        type: NotificationType.CANDIDATE_REJECTED,
        category: NotificationCategory.CANDIDATE,
        priority: NotificationPriority.HIGH,
        actionUrl: '/user/applications',
        metadata: {
          applicationId: params.applicationId,
          jobTitle: params.jobTitle,
        },
      });
    }
  }

  /**
   * 3. Ứng viên xác nhận tham gia lịch phỏng vấn
   */
  async notifyCandidateInterviewConfirmed(params: {
    candidateName: string;
    jobTitle: string;
    dateFormatted: string;
    timeRange: string;
    interviewId: string;
    interviewerId?: string;
    interviewerIds?: string[];
    departmentId?: string;
  }) {
    // Báo HR Admins
    await this.notifyHrAdmins({
      title: 'Ứng viên đã xác nhận phỏng vấn',
      message: `Ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã xác nhận tham gia phỏng vấn vào lúc ${params.timeRange}, ngày ${params.dateFormatted}.`,
      type: NotificationType.INTERVIEW_CONFIRMATION,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.HIGH,
      actionUrl: '/interviews',
      metadata: {
        interviewId: params.interviewId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
      },
    });

    // Báo Người phỏng vấn (Interviewer)
    const interviewerList = new Set<string>();
    if (params.interviewerId) interviewerList.add(params.interviewerId);
    if (params.interviewerIds && Array.isArray(params.interviewerIds)) {
      params.interviewerIds.forEach((id) => id && interviewerList.add(id));
    }

    for (const invId of interviewerList) {
      await this.create({
        recipientId: invId,
        title: 'Ứng viên đã xác nhận phỏng vấn',
        message: `Ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã xác nhận tham gia phỏng vấn vào lúc ${params.timeRange}, ngày ${params.dateFormatted}.`,
        type: NotificationType.INTERVIEW_CONFIRMATION,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.HIGH,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
        },
      });
    }

    // Báo Trưởng phòng
    if (params.departmentId) {
      await this.notifyDepartmentManagers(params.departmentId, {
        title: 'Ứng viên đã xác nhận phỏng vấn',
        message: `Ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã xác nhận tham gia phỏng vấn vào lúc ${params.timeRange}, ngày ${params.dateFormatted}.`,
        type: NotificationType.INTERVIEW_CONFIRMATION,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
        },
      });
    }
  }

  /**
   * 4. Ứng viên gửi yêu cầu hủy lịch phỏng vấn
   */
  async notifyInterviewCancellationRequested(params: {
    candidateName: string;
    jobTitle: string;
    dateFormatted: string;
    timeRange: string;
    reason: string;
    interviewId: string;
    interviewerId?: string;
    interviewerIds?: string[];
    departmentId?: string;
  }) {
    // Báo HR Admins
    await this.notifyHrAdmins({
      title: 'Ứng viên yêu cầu hủy lịch phỏng vấn',
      message: `Ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") yêu cầu hủy buổi phỏng vấn ngày ${params.dateFormatted} (${params.timeRange}). Lý do: "${params.reason}". Vui lòng kiểm tra và duyệt hủy hoặc đổi lịch.`,
      type: NotificationType.INTERVIEW_CANCEL_REQUESTED,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.URGENT,
      actionUrl: '/interviews',
      metadata: {
        interviewId: params.interviewId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
        reason: params.reason,
      },
    });

    // Báo Người phỏng vấn
    const interviewerList = new Set<string>();
    if (params.interviewerId) interviewerList.add(params.interviewerId);
    if (params.interviewerIds && Array.isArray(params.interviewerIds)) {
      params.interviewerIds.forEach((id) => id && interviewerList.add(id));
    }

    for (const invId of interviewerList) {
      await this.create({
        recipientId: invId,
        title: 'Ứng viên yêu cầu hủy lịch phỏng vấn',
        message: `Ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã yêu cầu hủy lịch phỏng vấn ngày ${params.dateFormatted} (${params.timeRange}). Lý do: "${params.reason}".`,
        type: NotificationType.INTERVIEW_CANCEL_REQUESTED,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.HIGH,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
          reason: params.reason,
        },
      });
    }
  }

  /**
   * 5. HR duyệt yêu cầu hủy lịch phỏng vấn
   */
  async notifyInterviewCancellationApproved(params: {
    candidateName: string;
    jobTitle: string;
    dateFormatted: string;
    candidateUserId?: string;
    interviewId: string;
    interviewerId?: string;
    interviewerIds?: string[];
    departmentId?: string;
  }) {
    // Báo Ứng viên
    if (params.candidateUserId) {
      await this.create({
        recipientId: params.candidateUserId,
        title: 'Yêu cầu hủy lịch phỏng vấn đã được chấp thuận',
        message: `Buổi phỏng vấn vị trí "${params.jobTitle}" vào ngày ${params.dateFormatted} đã được hủy theo yêu cầu của bạn. HR sẽ liên hệ lại nếu có cập nhật mới.`,
        type: NotificationType.INTERVIEW_CANCEL_APPROVED,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.HIGH,
        actionUrl: '/user/applications',
        metadata: {
          interviewId: params.interviewId,
          jobTitle: params.jobTitle,
        },
      });
    }

    // Báo Người phỏng vấn
    const interviewerList = new Set<string>();
    if (params.interviewerId) interviewerList.add(params.interviewerId);
    if (params.interviewerIds && Array.isArray(params.interviewerIds)) {
      params.interviewerIds.forEach((id) => id && interviewerList.add(id));
    }

    for (const invId of interviewerList) {
      await this.create({
        recipientId: invId,
        title: 'Lịch phỏng vấn đã được hủy',
        message: `Lịch phỏng vấn với ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") vào ngày ${params.dateFormatted} đã được HR hủy chính thức.`,
        type: NotificationType.INTERVIEW_CANCEL_APPROVED,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.HIGH,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
        },
      });
    }

    // Báo Trưởng phòng
    if (params.departmentId) {
      await this.notifyDepartmentManagers(params.departmentId, {
        title: 'Lịch phỏng vấn đã được hủy',
        message: `Lịch phỏng vấn với ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") vào ngày ${params.dateFormatted} đã được hủy.`,
        type: NotificationType.INTERVIEW_CANCEL_APPROVED,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
        },
      });
    }
  }

  /**
   * 6. HR đổi lịch phỏng vấn -> Thông báo Người phỏng vấn & Trưởng phòng
   */
  async notifyInterviewRescheduledStaff(params: {
    candidateName: string;
    jobTitle: string;
    dateFormatted: string;
    timeRange: string;
    interviewId: string;
    interviewerId?: string;
    interviewerIds?: string[];
    departmentId?: string;
  }) {
    const interviewerList = new Set<string>();
    if (params.interviewerId) interviewerList.add(params.interviewerId);
    if (params.interviewerIds && Array.isArray(params.interviewerIds)) {
      params.interviewerIds.forEach((id) => id && interviewerList.add(id));
    }

    for (const invId of interviewerList) {
      await this.create({
        recipientId: invId,
        title: 'Lịch phỏng vấn đã thay đổi thời gian',
        message: `Lịch phỏng vấn ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã được cập nhật sang lúc ${params.timeRange}, ngày ${params.dateFormatted}. Vui lòng kiểm tra lại lịch trình.`,
        type: NotificationType.INTERVIEW_RESCHEDULED,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.HIGH,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
        },
      });
    }

    if (params.departmentId) {
      await this.notifyDepartmentManagers(params.departmentId, {
        title: 'Lịch phỏng vấn đã thay đổi thời gian',
        message: `Lịch phỏng vấn ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã được cập nhật sang lúc ${params.timeRange}, ngày ${params.dateFormatted}.`,
        type: NotificationType.INTERVIEW_RESCHEDULED,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
        },
      });
    }
  }

  /**
   * 7. Người phỏng vấn gửi đánh giá chính thức
   */
  async notifyInterviewEvaluationSubmitted(params: {
    candidateName: string;
    jobTitle: string;
    interviewerName: string;
    recommendationLabel: string;
    overallScore?: number;
    interviewId: string;
    departmentId?: string;
  }) {
    const scoreStr = params.overallScore !== undefined ? ` (Điểm: ${params.overallScore}/100)` : '';

    // Báo HR Admins
    await this.notifyHrAdmins({
      title: 'Người phỏng vấn đã gửi đánh giá',
      message: `Người phỏng vấn ${params.interviewerName} đã nộp đánh giá cho ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}"). Đề xuất: ${params.recommendationLabel}${scoreStr}.`,
      type: NotificationType.INTERVIEW_EVALUATION_SUBMITTED,
      category: NotificationCategory.INTERVIEW,
      priority: NotificationPriority.HIGH,
      actionUrl: '/interviews',
      metadata: {
        interviewId: params.interviewId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
        recommendation: params.recommendationLabel,
        score: params.overallScore,
      },
    });

    // Báo Trưởng phòng
    if (params.departmentId) {
      await this.notifyDepartmentManagers(params.departmentId, {
        title: 'Đã có kết quả đánh giá phỏng vấn',
        message: `Người phỏng vấn ${params.interviewerName} đã gửi đánh giá cho ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}"). Đề xuất: ${params.recommendationLabel}${scoreStr}.`,
        type: NotificationType.INTERVIEW_EVALUATION_SUBMITTED,
        category: NotificationCategory.INTERVIEW,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/interviews',
        metadata: {
          interviewId: params.interviewId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
          recommendation: params.recommendationLabel,
          score: params.overallScore,
        },
      });
    }
  }

  /**
   * 8. HR gửi Offer -> Thông báo Trưởng phòng ban
   */
  async notifyDeptOfferSent(params: {
    candidateName: string;
    jobTitle: string;
    salaryFormatted: string;
    expirationDateFormatted: string;
    offerId: string;
    departmentId?: string;
  }) {
    if (!params.departmentId) return;

    await this.notifyDepartmentManagers(params.departmentId, {
      title: 'HR đã gửi Thư mời nhận việc (Offer)',
      message: `HR đã gửi Lời mời nhận việc cho ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}"). Mức lương: ${params.salaryFormatted}, Hạn phản hồi: ${params.expirationDateFormatted}.`,
      type: NotificationType.OFFER_SENT,
      category: NotificationCategory.OFFER,
      priority: NotificationPriority.HIGH,
      actionUrl: '/offers',
      metadata: {
        offerId: params.offerId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
      },
    });
  }

  /**
   * 10. HR xác nhận tuyển ứng viên (HIRED / Trúng tuyển)
   */
  async notifyCandidateHired(params: {
    candidateName: string;
    jobTitle: string;
    candidateUserId?: string;
    applicationId?: string;
    departmentId?: string;
  }) {
    // Báo Ứng viên
    if (params.candidateUserId) {
      await this.create({
        recipientId: params.candidateUserId,
        title: 'Chúc mừng bạn đã chính thức trúng tuyển! 🎉',
        message: `Chúc mừng bạn! Bạn đã hoàn tất xuất sắc quy trình tuyển dụng và chính thức trúng tuyển vào vị trí "${params.jobTitle}". Bộ phận nhân sự sẽ liên hệ hướng dẫn các bước tiếp theo.`,
        type: NotificationType.CANDIDATE_HIRED,
        category: NotificationCategory.CANDIDATE,
        priority: NotificationPriority.URGENT,
        actionUrl: '/user/applications',
        metadata: {
          applicationId: params.applicationId,
          jobTitle: params.jobTitle,
        },
      });
    }

    // Báo Trưởng phòng
    if (params.departmentId) {
      await this.notifyDepartmentManagers(params.departmentId, {
        title: 'Ứng viên chính thức trúng tuyển (HIRED)',
        message: `Ứng viên ${params.candidateName} đã chính thức trúng tuyển vào vị trí "${params.jobTitle}" thuộc phòng ban của bạn.`,
        type: NotificationType.CANDIDATE_HIRED,
        category: NotificationCategory.RECRUITMENT,
        priority: NotificationPriority.HIGH,
        actionUrl: '/kanban',
        metadata: {
          applicationId: params.applicationId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
        },
      });
    }

    // Báo HR Admins
    await this.notifyHrAdmins({
      title: 'Ứng viên chính thức trúng tuyển (HIRED)',
      message: `Ứng viên ${params.candidateName} đã chính thức trúng tuyển vị trí "${params.jobTitle}".`,
      type: NotificationType.CANDIDATE_HIRED,
      category: NotificationCategory.RECRUITMENT,
      priority: NotificationPriority.HIGH,
      actionUrl: '/kanban',
      metadata: {
        applicationId: params.applicationId,
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
      },
    });
  }

  /**
   * 11. HR từ chối ứng viên (Reject Application)
   */
  async notifyCandidateRejectedByHr(params: {
    candidateName: string;
    jobTitle: string;
    reason?: string;
    candidateUserId?: string;
    applicationId?: string;
    departmentId?: string;
  }) {
    const reasonText = params.reason ? ` Lý do: "${params.reason}".` : '';

    // Báo Ứng viên
    if (params.candidateUserId) {
      await this.create({
        recipientId: params.candidateUserId,
        title: 'Thông báo kết quả ứng tuyển',
        message: `Cảm ơn bạn đã dành thời gian ứng tuyển vị trí "${params.jobTitle}". Rất tiếc, hiện tại hồ sơ của bạn chưa phù hợp với yêu cầu tuyển dụng. Chúc bạn thành công trên con đường sự nghiệp!`,
        type: NotificationType.CANDIDATE_REJECTED,
        category: NotificationCategory.CANDIDATE,
        priority: NotificationPriority.HIGH,
        actionUrl: '/user/applications',
        metadata: {
          applicationId: params.applicationId,
          jobTitle: params.jobTitle,
        },
      });
    }

    // Báo Trưởng phòng nếu có phòng ban
    if (params.departmentId) {
      await this.notifyDepartmentManagers(params.departmentId, {
        title: 'Hồ sơ ứng viên đã bị từ chối',
        message: `Hồ sơ ứng viên ${params.candidateName} (Vị trí: "${params.jobTitle}") đã được HR xác nhận từ chối.${reasonText}`,
        type: NotificationType.CANDIDATE_REJECTED,
        category: NotificationCategory.RECRUITMENT,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/kanban',
        metadata: {
          applicationId: params.applicationId,
          candidateName: params.candidateName,
          jobTitle: params.jobTitle,
          reason: params.reason,
        },
      });
    }
  }

  async getUserNotifications(userId: string, query: QueryNotificationDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const { page = 1, limit = 20, isRead, category } = query;
    const filter: any = { recipientId: new Types.ObjectId(userId) };

    if (isRead !== undefined) {
      filter.isRead = isRead;
    }
    if (category) {
      filter.category = category;
    }

    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'senderId', select: 'name email role' })
        .exec(),
      this.notificationModel.countDocuments(filter).exec(),
      this.notificationModel.countDocuments({ recipientId: new Types.ObjectId(userId), isRead: false }).exec(),
    ]);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) return 0;
    return this.notificationModel.countDocuments({
      recipientId: new Types.ObjectId(userId),
      isRead: false,
    }).exec();
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationDocument> {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestException('Notification ID không hợp lệ');
    }

    const notification = await this.notificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        recipientId: new Types.ObjectId(userId),
      },
      {
        $set: { isRead: true, readAt: new Date() },
      },
      { new: true },
    ).exec();

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo hoặc bạn không có quyền xem thông báo này');
    }

    const unreadCount = await this.getUnreadCount(userId);
    this.notificationsGateway.emitUnreadCount(userId, unreadCount);

    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const result = await this.notificationModel.updateMany(
      {
        recipientId: new Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      },
    ).exec();

    this.notificationsGateway.emitUnreadCount(userId, 0);

    return { modifiedCount: result.modifiedCount };
  }

  async deleteNotification(notificationId: string, userId: string) {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestException('Notification ID không hợp lệ');
    }

    const result = await this.notificationModel.findOneAndDelete({
      _id: new Types.ObjectId(notificationId),
      recipientId: new Types.ObjectId(userId),
    }).exec();

    if (!result) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    const unreadCount = await this.getUnreadCount(userId);
    this.notificationsGateway.emitUnreadCount(userId, unreadCount);

    return { message: 'Xóa thông báo thành công' };
  }
}
