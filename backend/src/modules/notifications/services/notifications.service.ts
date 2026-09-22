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
        filter.departmentId = new Types.ObjectId(departmentId);
      }

      const managers = await this.userModel.find(filter).exec();

      if (!managers || managers.length === 0) {
        this.logger.warn(`Không tìm thấy Trưởng phòng nào cho phòng ban ${departmentId}`);
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
        departmentId: typeof job.departmentId === 'object' ? job.departmentId?._id?.toString() : job.departmentId?.toString(),
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
    const deptId = typeof job.departmentId === 'object' ? job.departmentId?._id?.toString() : job.departmentId?.toString();
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
    const deptId = typeof job.departmentId === 'object' ? job.departmentId?._id?.toString() : job.departmentId?.toString();
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
