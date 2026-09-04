import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AiEvaluationDocument = AiEvaluation & Document;

@Schema({ _id: false })
export class EvaluatedCriterion {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['MANDATORY', 'PREFERRED'] })
  requirementType: string;

  @Prop({ required: true, type: Number })
  weight: number;

  @Prop({ required: true, type: Number, enum: [0, 20, 40, 60, 80, 100] })
  score: number;

  @Prop({ required: true, type: Number })
  scoreContribution: number;

  @Prop({ default: '' })
  evidence: string;

  @Prop({ default: false })
  isEvidenceVerified: boolean; // Flag chống ảo giác bằng chứng

  @Prop({ default: false })
  isPassed: boolean;

  @Prop({ required: false, type: Number, default: 0 })
  evidenceStrengthScore: number; // Chỉ số phụ: Điểm độ mạnh bằng chứng (0 - 100)
}
export const EvaluatedCriterionSchema = SchemaFactory.createForClass(EvaluatedCriterion);

@Schema({ timestamps: true })
export class AiEvaluation {
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true, unique: true, index: true })
  applicationId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  aiFitScore: number;

  @Prop({ required: false, type: Number, default: 0 })
  evidenceStrengthScore: number; // Điểm độ mạnh bằng chứng tổng hợp (0 - 100)

  @Prop({ required: true, default: false })
  isMissingMandatory: boolean;

  @Prop({ type: [String], default: [] })
  warnings: string[];

  @Prop({ default: '' })
  summary: string;

  @Prop({ type: [String], default: [] })
  keyStrengths: string[];

  @Prop({ type: [String], default: [] })
  potentialGaps: string[];

  @Prop({ type: [String], default: [] })
  suggestedQuestions: string[];

  @Prop({ type: [EvaluatedCriterionSchema], default: [] })
  evaluatedCriteria: EvaluatedCriterion[];

  @Prop({ type: Date, default: Date.now })
  evaluatedAt: Date;
}

export const AiEvaluationSchema = SchemaFactory.createForClass(AiEvaluation);