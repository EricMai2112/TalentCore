import { apiClient } from "@/src/lib/api-client";
import { CandidateApplication } from "../types/candidate.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const candidateApi = {
  getCandidates: async (params?: {
    departmentId?: string;
    jobId?: string;
    search?: string;
  }): Promise<CandidateApplication[]> => {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.append("departmentId", params.departmentId);
    if (params?.jobId) searchParams.append("jobId", params.jobId);
    if (params?.search) searchParams.append("search", params.search);

    const res = await apiClient.get<ApiResponse<CandidateApplication[]>>(
      `/applications/kanban?${searchParams.toString()}`
    );
    return res.data || [];
  },

  addNote: async (
    applicationId: string,
    note: { authorName: string; authorRole: string; content: string }
  ): Promise<CandidateApplication> => {
    const res = await apiClient.post<ApiResponse<CandidateApplication>>(
      `/applications/${applicationId}/notes`,
      note
    );
    return res.data;
  },

  deleteApplication: async (applicationId: string): Promise<void> => {
    await apiClient.delete(`/applications/${applicationId}`);
  },

  updateStage: async (
    applicationId: string,
    stageId: string
  ): Promise<CandidateApplication> => {
    const res = await apiClient.put<ApiResponse<CandidateApplication>>(
      `/applications/${applicationId}/stage`,
      { stageId }
    );
    return res.data;
  },
};
