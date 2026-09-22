export enum NotificationType {
  JD_CREATED_PENDING = 'JD_CREATED_PENDING',
  JD_APPROVED = 'JD_APPROVED',
  JD_REJECTED = 'JD_REJECTED',
  STAGE_DEPARTMENT_REVIEW = 'STAGE_DEPARTMENT_REVIEW',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  AI_MATCHING_COMPLETED = 'AI_MATCHING_COMPLETED',
  STAGE_CHANGED = 'STAGE_CHANGED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_REQUEST_DEPT_SCHEDULE = 'INTERVIEW_REQUEST_DEPT_SCHEDULE',
  INTERVIEW_DEPT_SUBMITTED = 'INTERVIEW_DEPT_SUBMITTED',
  INTERVIEW_APPROVED = 'INTERVIEW_APPROVED',
  INTERVIEW_CONFIRMATION = 'INTERVIEW_CONFIRMATION',
  INTERVIEW_RESCHEDULED = 'INTERVIEW_RESCHEDULED',
  OFFER_SENT = 'OFFER_SENT',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  SYSTEM = 'SYSTEM',
}

export enum NotificationCategory {
  RECRUITMENT = 'RECRUITMENT',
  CANDIDATE = 'CANDIDATE',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface NotificationItem {
  _id: string;
  recipientId?: string;
  recipientUserId?: string;
  recipientRole?: string;
  recipientDepartmentId?: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}
