import { apiClient } from "@/src/lib/api-client";
import { CandidateProfile } from "../types/profile.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const profileApi = {
  getMyProfile: async (): Promise<CandidateProfile> => {
    const response: any = await apiClient.get("/candidates/profile");
    return response.data || response;
  },
};