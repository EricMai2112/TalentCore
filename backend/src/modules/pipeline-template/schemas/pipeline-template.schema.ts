import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PipelineTemplateDocument = PipelineTemplate & Document;

export enum StageType {
  SOURCING = 'SOURCING',
  SCREENING = 'SCREENING',
  DEPARTMENT_REVIEW = 'DEPARTMENT_REVIEW',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  OTHER = 'OTHER',
}

@Schema({ _id: true })
export class Stage {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  color: string;

  @Prop({ type: String, enum: StageType, default: StageType.OTHER })
  stageType: StageType;
}

export const StageSchema = SchemaFactory.createForClass(Stage);

@Schema({ timestamps: true })
export class PipelineTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [StageSchema], default: [] })
  stages: Stage[];
}

export const PipelineTemplateSchema =
  SchemaFactory.createForClass(PipelineTemplate);
