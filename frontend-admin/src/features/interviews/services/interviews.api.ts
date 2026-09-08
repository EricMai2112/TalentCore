import { apiClient } from "@/src/lib/api-client";
import {
  InterviewItem,
  CandidateSelectOption,
  CreateInterviewPayload,
  UpdateInterviewPayload,
  InterviewStatus,
  InterviewResult,
  AvailableSlot,
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

  getInterviewById: async (id: string): Promise<InterviewItem> => {
    const res = await apiClient.get<InterviewItem>(`/interviews/${id}`);
    return res;
  },

  getCandidatesForSelect: async (): Promise<CandidateSelectOption[]> => {
    const res = await apiClient.get<CandidateSelectOption[]>("/interviews/candidates-select");
    return res || [];
  },

  getAvailableSlots: async (interviewerId?: string, date?: string): Promise<AvailableSlot[]> => {
    const searchParams = new URLSearchParams();
    if (interviewerId) searchParams.append("interviewerId", interviewerId);
    if (date) searchParams.append("date", date);
    const res = await apiClient.get<AvailableSlot[]>(`/interviews/available-slots?${searchParams.toString()}`);
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

  approveReschedule: async (id: string): Promise<InterviewItem> => {
    const res = await apiClient.patch<InterviewItem>(`/interviews/${id}/approve-reschedule`, {});
    return res;
  },

  rejectReschedule: async (id: string, reason?: string): Promise<InterviewItem> => {
    const res = await apiClient.patch<InterviewItem>(`/interviews/${id}/reject-reschedule`, {
      reason,
    });
    return res;
  },

  proposeAdminSlots: async (
    id: string,
    proposedSlots: { date: string; startTime: string; endTime: string }[],
    notes?: string
  ): Promise<InterviewItem> => {
    const res = await apiClient.patch<InterviewItem>(`/interviews/${id}/propose-admin-slots`, {
      proposedSlots,
      notes,
    });
    return res;
  },

  checkConflict: async (params: {
    interviewerId: string;
    date: string;
    startTime: string;
    endTime: string;
    excludeInterviewId?: string;
  }): Promise<{
    hasConflict: boolean;
    conflict?: {
      candidateName: string;
      timeSlot: string;
      dateFormatted: string;
    };
  }> => {
    const searchParams = new URLSearchParams({
      interviewerId: params.interviewerId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
    });
    if (params.excludeInterviewId) {
      searchParams.append("excludeInterviewId", params.excludeInterviewId);
    }
    const res = await apiClient.get<any>(`/interviews/check-conflict?${searchParams.toString()}`);
    return res;
  },

  approveCandidateCancellation: async (id: string): Promise<InterviewItem> => {
    const res = await apiClient.patch<InterviewItem>(`/interviews/${id}/approve-cancel`, {});
    return res;
  },
};
