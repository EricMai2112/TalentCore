export enum LocationType {
  ONLINE = 'ONLINE',
  OFFSITE = 'OFFSITE',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED', // Đã lên lịch
  COMPLETED = 'COMPLETED', // Hoàn thành
  CANCELLED = 'CANCELLED', // Đã hủy
}

export enum InterviewResult {
  PENDING = 'PENDING',
  PASS = 'PASS',
  FAIL = 'FAIL',
}

export interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface CandidateSelectOption {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  label: string;
  jobDescriptionId?: string;
  departmentId?: string;
  departmentName?: string;
  defaultInterviewerId?: string | null;
  defaultInterviewerName?: string | null;
  assignedInterviewers?: any[];
  departmentStaff?: StaffUser[];
}

export interface InterviewItem {
  _id: string;
  applicationId: string;
  candidateId: {
    _id: string;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  jobDescriptionId: {
    _id: string;
    title: string;
    departmentId?: {
      _id: string;
      name: string;
    };
  };
  interviewerId: {
    _id: string;
    name?: string;
    email?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  locationType: LocationType;
  meetingLink?: string;
  offsiteLocation?: string;
  status: InterviewStatus;
  result: InterviewResult;
  notes?: string;
  feedback?: string;
  createdAt?: string;
}

export interface CreateInterviewPayload {
  applicationId: string;
  interviewerId: string;
  date: string;
  startTime: string;
  endTime: string;
  locationType: LocationType;
  autoCreateMeet?: boolean;
  meetingLink?: string;
  offsiteLocation?: string;
  notes?: string;
}

export interface UpdateInterviewPayload {
  interviewerId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  locationType?: LocationType;
  autoCreateMeet?: boolean;
  meetingLink?: string;
  offsiteLocation?: string;
  notes?: string;
  status?: InterviewStatus;
  result?: InterviewResult;
  feedback?: string;
}
