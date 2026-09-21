import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

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

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  senderId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, enum: NotificationCategory, default: NotificationCategory.RECRUITMENT })
  category: NotificationCategory;

  @Prop({ required: true, enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt?: Date;

  @Prop({ default: '' })
  actionUrl: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
