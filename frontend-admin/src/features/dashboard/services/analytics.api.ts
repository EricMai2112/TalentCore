import { apiClient } from '@/src/lib/api-client';
import { DashboardData, OverviewKpis, RecruitmentFunnel, DepartmentFulfillment, OfferBreakdown, ApplicationTrends, AiInsights, RecentActivities } from '../types/dashboard.types';

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const analyticsApi = {
  /** Lấy toàn bộ dữ liệu dashboard trong 1 request */
  getAllDashboardData: async (months = 6, limit = 5): Promise<DashboardData> => {
    const res = await apiClient.get<ApiResponse<DashboardData>>(
      `/analytics/all?months=${months}&limit=${limit}`
    );
    return res.data;
  },

  getKpis: async (): Promise<OverviewKpis> => {
    const res = await apiClient.get<ApiResponse<OverviewKpis>>('/analytics/kpis');
    return res.data;
  },

  getFunnel: async (): Promise<RecruitmentFunnel> => {
    const res = await apiClient.get<ApiResponse<RecruitmentFunnel>>('/analytics/recruitment-funnel');
    return res.data;
  },

  getDepartmentFulfillment: async (): Promise<DepartmentFulfillment[]> => {
    const res = await apiClient.get<ApiResponse<DepartmentFulfillment[]>>('/analytics/department-fulfillment');
    return res.data;
  },

  getOfferBreakdown: async (): Promise<OfferBreakdown> => {
    const res = await apiClient.get<ApiResponse<OfferBreakdown>>('/analytics/offers-breakdown');
    return res.data;
  },

  getTrends: async (months = 6): Promise<ApplicationTrends> => {
    const res = await apiClient.get<ApiResponse<ApplicationTrends>>(`/analytics/timeline-trends?months=${months}`);
    return res.data;
  },

  getAiInsights: async (): Promise<AiInsights> => {
    const res = await apiClient.get<ApiResponse<AiInsights>>('/analytics/ai-insights');
    return res.data;
  },

  getRecentActivities: async (limit = 5): Promise<RecentActivities> => {
    const res = await apiClient.get<ApiResponse<RecentActivities>>(`/analytics/recent-activities?limit=${limit}`);
    return res.data;
  },
};
