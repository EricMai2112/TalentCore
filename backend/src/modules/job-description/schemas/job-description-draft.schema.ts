import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDescriptionDraftDocument = JobDescriptionDraft & Document;

@Schema({ timestamps: true })
export class JobDescriptionDraft {
  @Prop({ type: Types.ObjectId, ref: 'Position', required: true, index: true })
  positionId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  experienceLevel: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true, index: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  savedById: Types.ObjectId;

  @Prop({ type: Object, required: true })
  draftData: {
    title?: string;
    location?: string;
    employmentType?: string;
    minimumSalary?: number;
    maximumSalary?: number;
    headcount?: number;
    priority?: string;
    experienceLevel?: string;
    applicationDeadline?: string;
    requiredSkills?: string[];
    criteria?: any[];
    description?: string;
    requirements?: string;
    benefits?: string;
    pipelineTemplateId?: string;
    [key: string]: any;
  };
}

export const JobDescriptionDraftSchema = SchemaFactory.createForClass(JobDescriptionDraft);

JobDescriptionDraftSchema.index({ positionId: 1, experienceLevel: 1 }, { unique: true });
