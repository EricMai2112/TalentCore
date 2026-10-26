export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export type CandidateRediscoveryTier = 'OFFER' | 'INTERVIEW';

export interface RecommendedCandidate {
  candidateId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  headline?: string;
  avatar?: string;
  skills: Array<{ name: string; proficiency?: string; yearsOfExperience?: number }>;
  previousJobTitle: string;
  previousJobId: string;
  previousApplicationId?: string;
  previousAiFitScore: number;
  evidenceStrengthScore?: number;
  keyStrengths: string[];
  appliedAt: string;
  tier?: CandidateRediscoveryTier;
  stageBadgeTitle?: string;
  interviewScore?: number;
  interviewRecommendation?: string;
  interviewRecommendationLabel?: string;
  invitation?: {
    _id: string;
    status: InvitationStatus;
    expiresAt: string;
    createdAt: string;
    note?: string;
  } | null;
}

export interface InviteCandidatePayload {
  jobDescriptionId: string;
  candidateId: string;
  note?: string;
  expireDays?: number;
}
