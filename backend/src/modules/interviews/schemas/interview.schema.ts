import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewDocument = Interview & Document;

export enum LocationType {
  ONLINE = 'ONLINE',
  OFFSITE = 'OFFSITE',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED', // Đã lên lịch (Chờ duyệt / Chờ xác nhận)
  UPCOMING = 'UPCOMING',   // Sắp diễn ra (Ứng viên đã xác nhận)
  IN_PROGRESS = 'IN_PROGRESS', // Đang diễn ra (Đang trong thời gian phỏng vấn)
  COMPLETED = 'COMPLETED', // Hoàn thành / Đã kết thúc
  CANCELLED = 'CANCELLED', // Đã hủy
}

export enum InterviewResult {
  PENDING = 'PENDING',
  PASS = 'PASS',
  FAIL = 'FAIL',
}

export enum InterviewConfirmationStatus {
  PENDING = 'PENDING',                             // Chờ xác nhận
  WAITING_DEPT_SCHEDULE = 'WAITING_DEPT_SCHEDULE', // Chờ Trưởng phòng xếp lịch / Xem CV ở Department Review
  WAITING_HR_APPROVAL = 'WAITING_HR_APPROVAL',     // Trưởng phòng đã xếp lịch -> Chờ HR phê duyệt
  SCHEDULED = 'SCHEDULED',                         // HR đã duyệt -> Chờ Ứng viên xác nhận
  CONFIRMED = 'CONFIRMED',                         // Ứng viên đã xác nhận tham gia (Sắp diễn ra)
  CANCEL_REQUESTED = 'CANCEL_REQUESTED',           // Ứng viên yêu cầu hủy lịch
  CANCELLED = 'CANCELLED',                         // HR đã duyệt hủy lịch
  REJECTED = 'REJECTED',                           // Trưởng phòng từ chối CV ở Department Review
}

@Schema({ timestamps: true })
export class Interview {
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true, index: true })
  applicationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true, index: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobDescription', required: true, index: true })
  jobDescriptionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  interviewerId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  interviewerIds: Types.ObjectId[];

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, trim: true })
  startTime: string; // e.g. "14:00"

  @Prop({ required: true, trim: true })
  endTime: string; // e.g. "15:30"

  @Prop({ required: true, enum: LocationType, default: LocationType.ONLINE })
  locationType: LocationType;

  @Prop({ required: false, trim: true })
  meetingLink?: string;

  @Prop({ required: false, trim: true })
  offsiteLocation?: string;

  @Prop({ required: true, enum: InterviewStatus, default: InterviewStatus.SCHEDULED })
  status: InterviewStatus;

  @Prop({ required: true, enum: InterviewResult, default: InterviewResult.PENDING })
  result: InterviewResult;

  @Prop({ required: false, trim: true })
  notes?: string;

  @Prop({ required: false, trim: true })
  feedback?: string;

  @Prop({ required: false, enum: InterviewConfirmationStatus, default: InterviewConfirmationStatus.SCHEDULED })
  confirmationStatus?: InterviewConfirmationStatus;

  @Prop({ required: false, trim: true })
  cancelReason?: string;

  @Prop({ default: false })
  isEscalated?: boolean;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
