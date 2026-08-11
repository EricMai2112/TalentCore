export enum EmailTemplateType {
  INTERVIEW_INVITATION = "INTERVIEW_INVITATION",
  OFFER_LETTER = "OFFER_LETTER",
  REJECTION = "REJECTION",
  CUSTOM = "CUSTOM",
}

export interface EmailTemplate {
  _id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  placeholders: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateDto {
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  placeholders?: string[];
}

export interface UpdateEmailTemplateDto {
  name?: string;
  type?: EmailTemplateType;
  subject?: string;
  body?: string;
  placeholders?: string[];
}
