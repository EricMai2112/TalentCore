import { apiClient } from "@/src/lib/api-client";
import { KanbanApplication, KanbanFilterParams } from "../types/kanban.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const kanbanApi = {
  getKanbanApplications: async (params?: KanbanFilterParams): Promise<KanbanApplication[]> => {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.append("departmentId", params.departmentId);
    if (params?.jobId) searchParams.append("jobId", params.jobId);
    if (params?.search) searchParams.append("search", params.search);

    const res = await apiClient.get<ApiResponse<KanbanApplication[]>>(
      `/applications/kanban?${searchParams.toString()}`
    );
    return res.data || [];
  },

  updateApplicationStage: async (
    applicationId: string,
    stageId: string
  ): Promise<KanbanApplication> => {
    const res = await apiClient.put<ApiResponse<KanbanApplication>>(
      `/applications/${applicationId}/stage`,
      { stageId }
    );
    return res.data;
  },
};
