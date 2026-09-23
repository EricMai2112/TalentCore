import { apiClient } from "@/src/lib/api-client";
import { InterviewEvaluationData } from "../types/evaluation.types";

export const evaluationsApi = {
  getEvaluationByInterviewId: async (interviewId: string): Promise<InterviewEvaluationData | null> => {
    try {
      const res = await apiClient.get<InterviewEvaluationData>(`/interviews/${interviewId}/evaluation`);
      return res || null;
    } catch (err) {
      console.error("Lỗi khi tải bản đánh giá phỏng vấn:", err);
      return null;
    }
  },

  saveEvaluation: async (
    interviewId: string,
    data: Partial<InterviewEvaluationData>
  ): Promise<InterviewEvaluationData> => {
    const res = await apiClient.post<InterviewEvaluationData>(`/interviews/${interviewId}/evaluation`, data);
    return res;
  }
};
