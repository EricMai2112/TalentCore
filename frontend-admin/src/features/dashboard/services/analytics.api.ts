import { apiClient } from '@/src/lib/api-client';
import {
  DashboardData,
  OverviewKpis,
  RecruitmentFunnel,
  DepartmentFulfillment,
  OfferBreakdown,
  ApplicationTrends,
  RecentActivities,
  HiringVelocityMetrics,
  ExportReportData,
} from '../types/dashboard.types';

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const analyticsApi = {
  /** Lấy toàn bộ dữ liệu dashboard trong 1 request */
  getAllDashboardData: async (
    months = 6,
    limit = 5,
    departmentId?: string,
    jobDescriptionId?: string
  ): Promise<DashboardData> => {
    const params = new URLSearchParams({
      months: String(months),
      limit: String(limit),
    });
    if (departmentId && departmentId.trim() && departmentId !== 'ALL') {
      params.append('departmentId', departmentId.trim());
    }
    if (jobDescriptionId && jobDescriptionId.trim() && jobDescriptionId !== 'ALL') {
      params.append('jobDescriptionId', jobDescriptionId.trim());
    }
    const res = await apiClient.get<ApiResponse<DashboardData>>(
      `/analytics/all?${params.toString()}`
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

  getTrends: async (
    months = 6,
    departmentId?: string,
    jobDescriptionId?: string
  ): Promise<ApplicationTrends> => {
    const params = new URLSearchParams({ months: String(months) });
    if (departmentId && departmentId.trim() && departmentId !== 'ALL') {
      params.append('departmentId', departmentId.trim());
    }
    if (jobDescriptionId && jobDescriptionId.trim() && jobDescriptionId !== 'ALL') {
      params.append('jobDescriptionId', jobDescriptionId.trim());
    }
    const res = await apiClient.get<ApiResponse<ApplicationTrends>>(
      `/analytics/timeline-trends?${params.toString()}`
    );
    return res.data;
  },


  getHiringVelocity: async (): Promise<HiringVelocityMetrics> => {
    const res = await apiClient.get<ApiResponse<HiringVelocityMetrics>>('/analytics/hiring-velocity');
    return res.data;
  },

  getRecentActivities: async (limit = 5): Promise<RecentActivities> => {
    const res = await apiClient.get<ApiResponse<RecentActivities>>(`/analytics/recent-activities?limit=${limit}`);
    return res.data;
  },

  getExportReportData: async (
    departmentId?: string,
    jobDescriptionId?: string
  ): Promise<ExportReportData> => {
    const params = new URLSearchParams();
    if (departmentId && departmentId.trim() && departmentId !== 'ALL') {
      params.append('departmentId', departmentId.trim());
    }
    if (jobDescriptionId && jobDescriptionId.trim() && jobDescriptionId !== 'ALL') {
      params.append('jobDescriptionId', jobDescriptionId.trim());
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<ApiResponse<ExportReportData>>(
      `/analytics/export-report${queryString}`
    );
    return res.data;
  },
};
