export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface InvitedJobDescription {
  _id: string;
  title: string;
  location?: string;
  employmentType?: string;
  minimumSalary?: number;
  maximumSalary?: number;
  departmentId?: {
    _id: string;
    name: string;
    code?: string;
  };
  applicationDeadline?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
}

export interface CandidateInvitationItem {
  _id: string;
  jobDescriptionId: InvitedJobDescription;
  invitedById?: {
    name?: string;
    email?: string;
    role?: string;
  };
  status: InvitationStatus;
  previousAiFitScore?: number;
  note?: string;
  expiresAt: string;
  createdAt: string;
  respondedAt?: string;
  declineReason?: string;
}
