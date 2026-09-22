import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewDocument = Interview & Document;

export enum LocationType {
  ONLINE = 'ONLINE',
  OFFSITE = 'OFFSITE',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum InterviewResult {
  PENDING = 'PENDING',
  PASS = 'PASS',
  FAIL = 'FAIL',
}

export enum InterviewConfirmationStatus {
  PENDING = 'PENDING',
  WAITING_DEPT_SCHEDULE = 'WAITING_DEPT_SCHEDULE',
  WAITING_HR_APPROVAL = 'WAITING_HR_APPROVAL',
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCEL_REQUESTED = 'CANCEL_REQUESTED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  RESCHEDULE_REQUESTED = 'RESCHEDULE_REQUESTED',
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

  @Prop({ required: false, type: Date })
  date?: Date;

  @Prop({ required: false, trim: true })
  startTime?: string; // e.g. "14:00"

  @Prop({ required: false, trim: true })
  endTime?: string; // e.g. "15:30"

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
