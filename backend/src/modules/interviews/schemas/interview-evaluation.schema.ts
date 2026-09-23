import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewEvaluationDocument = InterviewEvaluation & Document;

export enum RecommendationType {
  STRONG_HIRE = 'STRONG_HIRE',
  HIRE = 'HIRE',
  CONSIDER = 'CONSIDER',
  NO_HIRE = 'NO_HIRE',
}

@Schema()
export class CriteriaScore {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string; // 'TECHNICAL' | 'SOFT_SKILLS' | 'CULTURE_FIT' | 'OTHER'

  @Prop({ required: true, min: 1, max: 5 })
  score: number;

  @Prop({ default: 1 })
  weight: number;

  @Prop({ required: false, trim: true })
  comment?: string;
}

const CriteriaScoreSchema = SchemaFactory.createForClass(CriteriaScore);

@Schema({ timestamps: true })
export class InterviewEvaluation {
  @Prop({ type: Types.ObjectId, ref: 'Interview', required: true, index: true })
  interviewId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Application', required: true, index: true })
  applicationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobDescription', required: true })
  jobDescriptionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  interviewerId: Types.ObjectId;

  @Prop({ default: true })
  isDraft: boolean;

  @Prop({ type: [CriteriaScoreSchema], default: [] })
  criteriaScores: CriteriaScore[];

  @Prop({ required: false, default: 0 })
  overallScore: number;

  @Prop({ required: false, trim: true })
  strengths?: string;

  @Prop({ required: false, trim: true })
  weaknesses?: string;

  @Prop({ required: false, enum: RecommendationType, default: RecommendationType.CONSIDER })
  recommendation?: RecommendationType;

  @Prop({ required: false, trim: true })
  generalFeedback?: string;
}

export const InterviewEvaluationSchema = SchemaFactory.createForClass(InterviewEvaluation);
