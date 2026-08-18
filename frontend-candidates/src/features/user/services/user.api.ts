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

  updateProfile: async (payload: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const response: any = await apiClient.patch<ApiResponse<CandidateProfile>>("/candidates/profile", payload);
    return response.data || response;
  },

  parseCvWithAi: async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('cv', file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/candidates/parse-cv`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Không thể bóc tách CV.');
    }

    const result = await res.json();
    return result.data;
  },
};