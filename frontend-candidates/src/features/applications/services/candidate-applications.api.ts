import { apiClient } from "@/src/lib/api-client";
import { MyApplicationsResponseData } from "../types/application.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const candidateApplicationsApi = {
  getMyApplications: async (): Promise<MyApplicationsResponseData> => {
    const res = await apiClient.get<ApiResponse<MyApplicationsResponseData>>(
      "/applications/my-applications"
    );
    return (
      res.data || {
        applications: [],
        stats: {
          totalApplied: 0,
          processingCount: 0,
          interviewCount: 0,
          offerCount: 0,
        },
      }
    );
  },
};
