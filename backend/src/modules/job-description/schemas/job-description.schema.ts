import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDescriptionDocument = JobDescription & Document;

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export enum JobStatus {
  PENDING = 'PENDING',       // Chờ duyệt
  APPROVED = 'APPROVED',     // Đã duyệt
  REJECTED = 'REJECTED',     // Từ chối
  JD_CREATED = 'JD_CREATED', // Đã tạo JD
}

export enum JobPriority {
  HIGH = 'HIGH',       // Gấp
  MEDIUM = 'MEDIUM',   // Bình thường
  LOW = 'LOW',         // Thấp
}

@Schema({ timestamps: true })
export class JobDescription {
  @Prop({ type: Types.ObjectId, ref: 'PipelineTemplate', required: true })
  pipelineTemplateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position', required: false })
  positionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  interviewerId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: true, enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType;

  @Prop({ required: true, type: Number })
  minimumSalary: number;

  @Prop({ required: true, type: Number })
  maximumSalary: number;

  @Prop({ type: [Types.ObjectId], ref: 'Skill', default: [] })
  requiredSkills: Types.ObjectId[];

  @Prop({ required: true, trim: true })
  experienceLevel: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  requirements: string;

  @Prop({ required: true, trim: true })
  benefits: string;

  @Prop({ required: true, enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Prop({ required: false, trim: true })
  note?: string;

  @Prop({ required: true, enum: JobPriority, default: JobPriority.MEDIUM })
  priority: JobPriority;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  postedById?: Types.ObjectId;

  @Prop({ required: true, type: Number, default: 1 })
  headcount: number;

  @Prop({ required: false, type: Date })
  applicationDeadline?: Date;
}

export const JobDescriptionSchema = SchemaFactory.createForClass(JobDescription);
