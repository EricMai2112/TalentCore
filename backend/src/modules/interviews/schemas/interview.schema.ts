import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewDocument = Interview & Document;

export enum LocationType {
  ONLINE = 'ONLINE',
  OFFSITE = 'OFFSITE',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED', // Đã lên lịch
  COMPLETED = 'COMPLETED', // Hoàn thành
  CANCELLED = 'CANCELLED', // Đã hủy
}

export enum InterviewResult {
  PENDING = 'PENDING',
  PASS = 'PASS',
  FAIL = 'FAIL',
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

  @Prop({ required: false, trim: true, default: 'CONFIRMED' })
  confirmationStatus?: string;

  @Prop({ default: 0 })
  rescheduleCount?: number;

  @Prop({ required: false, trim: true })
  rescheduleReason?: string;

  @Prop({ required: false, trim: true })
  rescheduleRejectReason?: string;

  @Prop({ required: false, trim: true })
  cancelReason?: string;

  @Prop({ required: false, type: Date })
  proposedCustomDate?: Date;

  @Prop({ required: false, trim: true })
  proposedCustomStartTime?: string;

  @Prop({ required: false, trim: true })
  proposedCustomEndTime?: string;

  @Prop({
    type: [
      {
        date: { type: Date },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
    default: [],
  })
  proposedSlots?: { date: Date; startTime: string; endTime: string }[];

  @Prop({ required: false, trim: true })
  proposedBy?: string;

  @Prop({ default: false })
  isEscalated?: boolean;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
