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
