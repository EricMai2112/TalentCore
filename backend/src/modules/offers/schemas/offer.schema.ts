import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

@Schema({ timestamps: true })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true, index: true })
  applicationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true, index: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobDescription', required: true, index: true })
  jobDescriptionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true, index: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId;

  @Prop({ required: true, trim: true })
  positionTitle: string;

  @Prop({ required: true, enum: ContractType, default: ContractType.FULL_TIME })
  contractType: ContractType;

  @Prop({ required: true, trim: true })
  workLocation: string;

  @Prop({ required: true, min: 0 })
  salary: number;

  @Prop({ required: true, default: 'VND' })
  currency: string;

  @Prop({ required: false, default: 2 })
  probationDurationMonths: number;

  @Prop({ required: false, default: 85 })
  probationSalaryPercentage: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  expirationDate: Date;

  @Prop({ type: [String], default: [] })
  benefits: string[];

  @Prop({ required: false, trim: true })
  notes?: string;

  @Prop({ required: true, trim: true })
  emailSubject: string;

  @Prop({ required: true })
  offerLetterHtml: string;

  @Prop({ required: true, enum: OfferStatus, default: OfferStatus.DRAFT, index: true })
  status: OfferStatus;

  @Prop({ required: false, type: Date })
  sentAt?: Date;

  @Prop({ required: false, type: Date })
  respondedAt?: Date;

  @Prop({ required: false, trim: true })
  declineReason?: string;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
