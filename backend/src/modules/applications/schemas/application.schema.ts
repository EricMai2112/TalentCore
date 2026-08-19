import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true, index: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobDescription', required: true, index: true })
  jobDescriptionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  currentStageId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  appliedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.index({ candidateId: 1, jobDescriptionId: 1 }, { unique: true });