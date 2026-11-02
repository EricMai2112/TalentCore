import { apiClient } from "@/src/lib/api-client";
import {
  RecommendedCandidate,
  InviteCandidatePayload,
} from "../types/candidate-rediscovery.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const candidateRediscoveryApi = {
  getRecommendations: async (jobDescriptionId: string): Promise<RecommendedCandidate[]> => {
    const res = await apiClient.get<ApiResponse<RecommendedCandidate[]>>(
      `/applications/rediscovery/recommendations/${jobDescriptionId}`
    );
    return res.data || [];
  },

  inviteCandidate: async (payload: InviteCandidatePayload): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(
      "/applications/rediscovery/invite",
      payload
    );
    return res.data;
  },
};
