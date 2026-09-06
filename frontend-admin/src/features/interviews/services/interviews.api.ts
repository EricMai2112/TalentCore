import { apiClient } from "@/src/lib/api-client";
import {
  InterviewItem,
  CandidateSelectOption,
  CreateInterviewPayload,
  UpdateInterviewPayload,
  InterviewStatus,
  InterviewResult,
} from "../types/interview.types";

export const interviewsApi = {
  getInterviews: async (status?: string): Promise<InterviewItem[]> => {
    const searchParams = new URLSearchParams();
    if (status && status !== "ALL" && status !== "Tất cả trạng thái") {
      searchParams.append("status", status);
    }
    const res = await apiClient.get<InterviewItem[]>(`/interviews?${searchParams.toString()}`);
    return res || [];
  },

  getCandidatesForSelect: async (): Promise<CandidateSelectOption[]> => {
    const res = await apiClient.get<CandidateSelectOption[]>("/interviews/candidates-select");
    return res || [];
  },

  createInterview: async (payload: CreateInterviewPayload): Promise<InterviewItem> => {
    const res = await apiClient.post<InterviewItem>("/interviews", payload);
    return res;
  },

  updateInterview: async (id: string, payload: UpdateInterviewPayload): Promise<InterviewItem> => {
    const res = await apiClient.put<InterviewItem>(`/interviews/${id}`, payload);
    return res;
  },

  updateStatus: async (
    id: string,
    status?: InterviewStatus,
    result?: InterviewResult,
    feedback?: string
  ): Promise<InterviewItem> => {
    const res = await apiClient.patch<InterviewItem>(`/interviews/${id}/status`, {
      status,
      result,
      feedback,
    });
    return res;
  },
};
