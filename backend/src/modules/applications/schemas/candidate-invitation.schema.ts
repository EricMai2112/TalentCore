import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CandidateInvitationDocument = CandidateInvitation & Document;

export enum InvitationStatus {
  PENDING = 'PENDING',       // Đang chờ ứng viên phản hồi
  ACCEPTED = 'ACCEPTED',     // Đã đồng ý tham gia đợt tuyển này
  DECLINED = 'DECLINED',     // Đã từ chối khéo
  EXPIRED = 'EXPIRED',       // Quá hạn phản hồi (sau 7 ngày)
  CANCELLED = 'CANCELLED',   // HR chủ động hủy lời mời
}

@Schema({ timestamps: true })
export class CandidateInvitation {
  @Prop({ type: Types.ObjectId, ref: 'JobDescription', required: true, index: true })
  jobDescriptionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true, index: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedById: Types.ObjectId;

  @Prop({ type: String, enum: InvitationStatus, default: InvitationStatus.PENDING, index: true })
  status: InvitationStatus;

  @Prop({ type: Types.ObjectId, ref: 'Application', required: false })
  previousApplicationId?: Types.ObjectId;

  @Prop({ type: Number, required: false })
  previousAiFitScore?: number;

  @Prop({ type: String, default: '' })
  note?: string;

  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  @Prop({ type: Date, required: false })
  respondedAt?: Date;

  @Prop({ type: String, default: '' })
  declineReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Application', required: false })
  acceptedApplicationId?: Types.ObjectId;
}

export const CandidateInvitationSchema = SchemaFactory.createForClass(CandidateInvitation);

CandidateInvitationSchema.index({ jobDescriptionId: 1, candidateId: 1 });
CandidateInvitationSchema.index({ userId: 1, status: 1 });
CandidateInvitationSchema.index({ expiresAt: 1, status: 1 });
