import { apiClient } from "@/src/lib/api-client";
import { CandidateInvitationItem } from "../types/candidate-invitation.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const candidateInvitationApi = {
  getMyInvitations: async (): Promise<CandidateInvitationItem[]> => {
    const res = await apiClient.get<ApiResponse<CandidateInvitationItem[]>>(
      "/applications/rediscovery/my-invitations"
    );
    return res.data || [];
  },

  respondInvitation: async (
    invitationId: string,
    action: "ACCEPT" | "DECLINE",
    declineReason?: string
  ): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(
      `/applications/rediscovery/respond/${invitationId}`,
      { action, declineReason }
    );
    return res;
  },
};
