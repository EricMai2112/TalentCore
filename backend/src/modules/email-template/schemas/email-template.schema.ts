import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailTemplateDocument = EmailTemplate & Document;

export enum EmailTemplateType {
  INTERVIEW_INVITATION = 'INTERVIEW_INVITATION',
  OFFER_LETTER = 'OFFER_LETTER',
  REJECTION = 'REJECTION',
  CUSTOM = 'CUSTOM',
}

@Schema({ timestamps: true })
export class EmailTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: EmailTemplateType })
  type: EmailTemplateType;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: [String], default: [] })
  placeholders: string[];
}

export const EmailTemplateSchema =
  SchemaFactory.createForClass(EmailTemplate);
