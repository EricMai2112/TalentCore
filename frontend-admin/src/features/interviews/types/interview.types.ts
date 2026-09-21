export enum LocationType {
  ONLINE = 'ONLINE',
  OFFSITE = 'OFFSITE',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',   // Đã lên lịch (Chờ ứng viên xác nhận)
  UPCOMING = 'UPCOMING',     // Sắp diễn ra
  IN_PROGRESS = 'IN_PROGRESS', // Đang diễn ra
  COMPLETED = 'COMPLETED',   // Hoàn thành / Đã kết thúc
  CANCELLED = 'CANCELLED',   // Đã hủy
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

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  dayOfWeek: string;
  isAvailable?: boolean;
  disabledReason?: string;
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
  confirmationStatus?: 'PENDING' | 'CONFIRMED' | 'WAITING_DEPT_SCHEDULE' | 'WAITING_HR_APPROVAL' | 'SCHEDULED' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'REJECTED' | string;
  cancelReason?: string;
  isEscalated?: boolean;
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
