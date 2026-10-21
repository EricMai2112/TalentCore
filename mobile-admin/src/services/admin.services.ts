import { apiClient } from './api.client';

export interface HeadcountPlan {
  target: number;
  hired: number;
  percentage: number;
  remaining: number;
}

export interface TimeToHire {
  avgDays: number | null;
  sampleSize: number;
  isEmpty: boolean;
}

export interface TimeToFill {
  avgDays: number | null;
  targetDays: number;
  isEmpty: boolean;
}

export interface OverviewKpis {
  headcountPlan: HeadcountPlan;
  candidates: {
    total: number;
    growth: number;
    growthText: string;
    newLast30Days: number;
  };
  jobs: {
    active: number;
    total: number;
    newCount: number;
    newText: string;
  };
  interviews: {
    today: number;
    upcoming: number;
    upcomingText: string;
    pendingResults: number;
  };
  offers: {
    total: number;
    accepted: number;
    sent: number;
    acceptanceRate: number;
    rateText: string;
    overdueCount: number;
  };
  timeToHire: TimeToHire;
  timeToFill?: TimeToFill;
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  stepConversionRate?: number;
  color: string;
}

export interface RecruitmentFunnel {
  isEmpty: boolean;
  totalApplications: number;
  stages: FunnelStage[];
  conversionRates?: {
    appliedToScreened: number;
    screenedToInterviewed: number;
    interviewedToOffered: number;
    offeredToHired: number;
    overallRate: number;
  };
}

export interface DepartmentFulfillment {
  id: string;
  name: string;
  code: string;
  targetHeadcount: number;
  hiredCount: number;
  activeJobs: number;
  percentage: number;
}

export interface OfferChartItem {
  name: string;
  count: number;
  color: string;
}

export interface OfferBreakdown {
  isEmpty: boolean;
  totalOffers: number;
  acceptanceRate: number;
  statusCounts: Record<string, number>;
  chartData: OfferChartItem[];
  declineReasons?: Array<{ reason: string; count: number }>;
}

export interface TrendMonth {
  month: string;
  applications: number;
  interviews: number;
  hired: number;
}

export interface ApplicationTrends {
  isEmpty: boolean;
  data: TrendMonth[];
}

export interface ExpiringOfferAlert {
  id: string;
  candidateName: string;
  positionTitle: string;
  expiresAt: string;
  daysLeft: number;
  isOverdue: boolean;
  salary: number;
}

export interface StaleApplicationAlert {
  id: string;
  candidateName: string;
  jobTitle: string;
  stageName: string;
  daysInStage: number;
  appliedAt: string;
}

export interface PendingJobAlert {
  id: string;
  title: string;
  deadline: string | null;
  daysLeft: number | null;
  isOverdue: boolean;
  applicationCount: number;
  targetHeadcount: number;
  hiredCount: number;
}

export interface TodayInterviewAlert {
  id: string;
  candidateName: string;
  jobTitle: string;
  startTime: string;
  endTime: string;
  interviewerName: string;
  locationType: string;
}

export interface ActionableAlerts {
  summary: {
    totalAlerts: number;
    expiringOffers: number;
    staleApplications: number;
    pendingJobs: number;
    todayInterviews: number;
  };
  expiringOffers: ExpiringOfferAlert[];
  staleApplications: StaleApplicationAlert[];
  pendingJobs: PendingJobAlert[];
  todayInterviews: TodayInterviewAlert[];
}

export interface DepartmentItem {
  _id: string;
  name: string;
  code?: string;
}

export interface DashboardData {
  kpis: OverviewKpis;
  funnel: RecruitmentFunnel;
  departmentFulfillment: DepartmentFulfillment[];
  offers: OfferBreakdown;
  alerts: ActionableAlerts;
  trends: ApplicationTrends;
}

export interface CandidateApplication {
  _id: string;
  candidateId: {
    _id: string;
    fullName?: string;
    profileName?: string;
    email?: string;
    phone?: string;
    currentLevel?: string;
    summary?: string;
    avatar?: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
  };
  jobDescriptionId: {
    _id: string;
    title: string;
    departmentId?: {
      _id: string;
      name: string;
      code?: string;
    } | string;
  };
  currentStageId: string;
  stageName?: string;
  stageColor?: string;
  appliedAt: string;
  status?: 'ACTIVE' | 'REJECTED' | 'HIRED' | string;
  aiFitScore?: number | null;
  isMissingMandatory?: boolean;
  notes?: any[];
  aiEvaluation?: {
    overallRecommendation?: string;
    matchingScore?: number;
    summary?: string;
  };
}

export interface JobDescriptionItem {
  _id: string;
  title: string;
  departmentId?: {
    _id: string;
    name: string;
    code?: string;
  } | string;
  departmentName?: string;
  location?: string;
  employmentType?: string;
  minimumSalary?: number;
  maximumSalary?: number;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  level?: string;
  headcount?: number;
  applicationDeadline?: string;
  deadline?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'JD_CREATED' | 'COMPLETED' | string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  applicantCount?: number;
  postedById?: {
    _id: string;
    name: string;
    email?: string;
  } | string;
  description?: string;
  requirements?: string;
  benefits?: string;
  note?: string;
  requiredSkills?: Array<{ _id: string; name: string } | string>;
  createdAt?: string;
  updatedAt?: string;
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
  locationType: 'ONLINE' | 'OFFSITE' | string;
  meetingLink?: string;
  offsiteLocation?: string;
  status: 'SCHEDULED' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;
  result: 'PENDING' | 'PASS' | 'FAIL' | string;
  confirmationStatus?: string;
  notes?: string;
  feedback?: string;
}

export interface OfferItem {
  _id: string;
  applicationId?: any;
  candidateId: {
    _id: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
    profileName?: string;
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
  positionTitle: string;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE' | string;
  workLocation: string;
  salary: number;
  startDate: string;
  expirationDate: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED' | string;
  isOtpVerified?: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  category: 'RECRUITMENT' | 'JD' | 'CANDIDATE' | 'INTERVIEW' | 'OFFER' | 'SYSTEM' | string;
  priority?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export const adminService = {
  async getDashboardData(params?: {
    departmentId?: string;
    jobDescriptionId?: string;
    months?: number;
    limit?: number;
  }): Promise<DashboardData> {
    const queryParams: Record<string, any> = {
      months: params?.months ?? 6,
      limit: params?.limit ?? 10,
    };
    if (params?.departmentId) queryParams.departmentId = params.departmentId;
    if (params?.jobDescriptionId) queryParams.jobDescriptionId = params.jobDescriptionId;

    const res = await apiClient.get<any>('/analytics/all', queryParams);
    return res;
  },

  async getDepartments(): Promise<DepartmentItem[]> {
    const data = await apiClient.get<any>('/departments');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  async getCandidates(params?: { search?: string; departmentId?: string; jobId?: string }): Promise<CandidateApplication[]> {
    const data = await apiClient.get<any>('/applications/kanban', params);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  async getJobs(): Promise<JobDescriptionItem[]> {
    const data = await apiClient.get<any>('/job-descriptions');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  async updateCandidateStage(applicationId: string, stageId: string): Promise<any> {
    return apiClient.put(`/applications/${applicationId}/stage`, { stageId });
  },

  async rejectCandidate(applicationId: string, reason: string): Promise<any> {
    return apiClient.post(`/applications/${applicationId}/reject`, { reason });
  },

  async getInterviews(status?: string): Promise<InterviewItem[]> {
    const data = await apiClient.get<any>('/interviews', status ? { status } : undefined);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  async updateInterviewStatus(
    id: string,
    payload: { status?: string; result?: string; feedback?: string }
  ): Promise<any> {
    return apiClient.patch(`/interviews/${id}/status`, payload);
  },

  async getOffers(params?: any): Promise<OfferItem[]> {
    const res = await apiClient.get<any>('/offers', { limit: 100, ...params });
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  },

  async updateOfferStatus(id: string, status: string): Promise<any> {
    return apiClient.patch(`/offers/${id}`, { status });
  },

  async updateJob(
    jobId: string,
    payload: { status?: string; note?: string; [key: string]: any }
  ): Promise<any> {
    return apiClient.put(`/job-descriptions/${jobId}`, payload);
  },

  async updateJobStatus(jobId: string, status: string): Promise<any> {
    return apiClient.put(`/job-descriptions/${jobId}`, { status });
  },

  async getPipelineStages(): Promise<Array<{ _id: string; name: string; color?: string }>> {
    try {
      const res = await apiClient.get<any>('/pipeline-templates');
      const templates = Array.isArray(res) ? res : res?.data || [];
      if (templates.length > 0 && Array.isArray(templates[0].stages)) {
        return templates[0].stages;
      }
    } catch {}
    return [
      { _id: '6a0000050000000000000001', name: 'Applied', color: '#3b82f6' },
      { _id: '6a0000050000000000000002', name: 'Screening', color: '#f59e0b' },
      { _id: '6a0000050000000000000003', name: 'Department Review', color: '#6366f1' },
      { _id: '6a0000050000000000000004', name: 'Interview', color: '#ec4899' },
      { _id: '6a0000050000000000000005', name: 'Offer', color: '#10b981' },
      { _id: '6a0000050000000000000006', name: 'Hired', color: '#8b5cf6' },
    ];
  },

  async getNotifications(): Promise<{ items: AdminNotification[]; unreadCount: number }> {
    const res = await apiClient.get<any>('/notifications', { limit: 100 });
    const payload = res?.data || res || {};
    const items = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload)
      ? payload
      : [];
    const unreadCount =
      typeof payload.unreadCount === 'number'
        ? payload.unreadCount
        : items.filter((i: any) => !i.isRead).length;
    return { items, unreadCount };
  },

  async markNotificationAsRead(id: string): Promise<any> {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllNotificationsAsRead(): Promise<any> {
    return apiClient.patch('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<any> {
    return apiClient.delete(`/notifications/${id}`);
  },
};
