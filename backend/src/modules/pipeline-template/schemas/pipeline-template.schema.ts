import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PipelineTemplateDocument = PipelineTemplate & Document;

@Schema({ _id: true })
export class Stage {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  color: string;
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
