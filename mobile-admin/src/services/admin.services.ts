import { apiClient } from './api.client';

export interface OverviewKpis {
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
  timeToHire: {
    avgDays: number | null;
    sampleSize: number;
    isEmpty: boolean;
  };
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
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

export interface OfferBreakdown {
  totalOffers: number;
  acceptanceRate: number;
  statusCounts: Record<string, number>;
  chartData: Array<{ name: string; count: number; color: string }>;
}

export interface RecentActivities {
  applications: Array<{
    id: string;
    candidateName: string;
    jobTitle: string;
    appliedAt: string;
  }>;
  interviews: Array<{
    id: string;
    candidateName: string;
    jobTitle: string;
    startTime: string;
    status: string;
  }>;
  offers: Array<{
    id: string;
    candidateName: string;
    positionTitle: string;
    salary: number;
    status: string;
    createdAt: string;
  }>;
}

export interface DashboardData {
  kpis: OverviewKpis;
  funnel: {
    stages: FunnelStage[];
    totalApplications: number;
  };
  departmentFulfillment: DepartmentFulfillment[];
  offersBreakdown: OfferBreakdown;
  recentActivities: RecentActivities;
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
  createdAt?: string;
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
  async getDashboardData(): Promise<DashboardData> {
    const res = await apiClient.get<any>('/analytics/all', { months: 6, limit: 10 });
    return res;
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
