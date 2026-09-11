export interface PipelineStageInfo {
  _id: string;
  name: string;
  color: string;
  order: number;
}

export interface AppliedJobDescription {
  _id: string;
  title: string;
  salaryRange?: string;
  location?: string;
  departmentId?: {
    _id: string;
    name: string;
  };
}

export interface CandidateApplicationItem {
  _id: string;
  candidateId: any;
  jobDescriptionId: AppliedJobDescription;
  currentStageId: string;
  appliedAt: string;
  stageName: string;
  stageColor?: string;
  currentStageIndex: number;
  stages: PipelineStageInfo[];
  aiFitScore?: number | null;
  aiEvaluation?: any;
}

export interface ApplicationStats {
  totalApplied: number;
  processingCount: number;
  interviewCount: number;
  offerCount: number;
}

export interface MyApplicationsResponseData {
  applications: CandidateApplicationItem[];
  stats: ApplicationStats;
}

export interface InterviewUserRef {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  dayOfWeek: string;
  isAvailable?: boolean;
  disabledReason?: string;
}

export interface CandidateInterviewItem {
  _id: string;
  applicationId: string;
  candidateId: any;
  jobDescriptionId: AppliedJobDescription;
  interviewerId?: InterviewUserRef;
  interviewerIds?: InterviewUserRef[];
  date: string;
  startTime: string;
  endTime: string;
  locationType: 'ONLINE' | 'OFFSITE';
  meetingLink?: string;
  offsiteLocation?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  result: 'PENDING' | 'PASS' | 'FAIL';
  confirmationStatus?: 'CONFIRMED' | 'PENDING' | 'WAITING_DEPT_SCHEDULE' | 'WAITING_HR_APPROVAL' | 'RESCHEDULE_REQUESTED' | 'RESCHEDULE_REJECTED' | 'ADMIN_PROPOSED' | 'CANCEL_REQUESTED' | 'CANCELLED' | string;
  rescheduleCount?: number;
  rescheduleReason?: string;
  rescheduleRejectReason?: string;
  cancelReason?: string;
  proposedCustomDate?: string;
  proposedCustomStartTime?: string;
  proposedCustomEndTime?: string;
  proposedSlots?: { date: string; startTime: string; endTime: string }[];
  proposedBy?: string;
  isEscalated?: boolean;
  createdAt?: string;
}
