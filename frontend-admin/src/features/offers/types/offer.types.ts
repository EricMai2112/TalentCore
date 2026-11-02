export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export interface OfferItem {
  _id: string;
  applicationId: {
    _id: string;
    status: string;
    currentStageId: string;
    appliedAt: string;
  } | string;
  candidateId: {
    _id: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
    profileName?: string;
    address?: string;
    cvPdfUrl?: string;
    skills?: any[];
    experiences?: any[];
  };
  jobDescriptionId: {
    _id: string;
    title: string;
    departmentId?: string;
    employmentType?: string;
  };
  departmentId: {
    _id: string;
    name: string;
    code: string;
  };
  createdById?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  positionTitle: string;
  contractType: ContractType;
  workLocation: string;
  salary: number;
  currency: string;
  probationDurationMonths: number;
  probationSalaryPercentage: number;
  startDate: string;
  expirationDate: string;
  benefits: string[];
  notes?: string;
  emailSubject: string;
  offerLetterHtml: string;
  status: OfferStatus;
  sentAt?: string;
  respondedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload {
  applicationId: string;
  candidateId: string;
  jobDescriptionId: string;
  departmentId: string;
  positionTitle: string;
  contractType?: ContractType;
  workLocation: string;
  salary: number;
  currency?: string;
  probationDurationMonths?: number;
  probationSalaryPercentage?: number;
  startDate: string;
  expirationDate: string;
  benefits?: string[];
  notes?: string;
  emailSubject: string;
  offerLetterHtml: string;
  sendImmediately?: boolean;
}

export interface UpdateOfferPayload {
  positionTitle?: string;
  contractType?: ContractType;
  workLocation?: string;
  salary?: number;
  currency?: string;
  probationDurationMonths?: number;
  probationSalaryPercentage?: number;
  startDate?: string;
  expirationDate?: string;
  benefits?: string[];
  notes?: string;
  emailSubject?: string;
  offerLetterHtml?: string;
}

export interface QueryOfferParams {
  page?: number;
  limit?: number;
  status?: string;
  departmentId?: string;
  jobDescriptionId?: string;
  search?: string;
}

export interface OfferListResponse {
  items: OfferItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
