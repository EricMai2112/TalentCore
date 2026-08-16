import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: '' })
  headline: string;

  @Prop({ default: '' })
  summary: string;

  @Prop({ default: '' })
  careerObjective: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  cvPdfUrl: string;

  @Prop({ type: Array, default: [] })
  socialLinks: { platform: string; url: string }[];

  @Prop({ type: Array, default: [] })
  skills: { skillId?: Types.ObjectId; name: string; proficiency?: string; yearsOfExperience?: number }[];

  @Prop({ type: Array, default: [] })
  experiences: {
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    technologies?: string[];
  }[];

  @Prop({ type: Array, default: [] })
  educations: {
    institution: string;
    degree?: string;
    major?: string;
    startDate?: string;
    endDate?: string;
    gpa?: number;
  }[];

  @Prop({ type: Array, default: [] })
  projects: {
    name: string;
    role?: string;
    description?: string;
    technologies?: string[];
    projectUrl?: string;
    startDate?: string;
    endDate?: string;
  }[];

  @Prop({ type: Array, default: [] })
  certifications: {
    name: string;
    organization?: string;
    scoreOrLevel?: string;
    issueDate?: string;
  }[];

  @Prop({ type: Array, default: [] })
  languages: { language: string; proficiency?: string }[];

  @Prop({ type: Array, default: [] })
  customSections: {
    sectionTitle: string;
    items: { title: string; subtitle?: string; date?: string; description?: string; url?: string }[];
  }[];
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);