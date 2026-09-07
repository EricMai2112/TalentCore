import { apiClient } from "@/src/lib/api-client";
import { CandidateProfile } from "../types/profile.types";
import { env } from "@/src/config/env.config";

interface ApiResponse<T> {
  message: string;
  data: T;
}

// ─── Multi-profile API ─────────────────────────────────────────────────────────

export const profileApi = {
  /**
   * List all profiles for the authenticated user.
   */
  listProfiles: async (): Promise<CandidateProfile[]> => {
    const response = await apiClient.get<CandidateProfile[]>("/candidates/profiles");
    return (response as any).data ?? response;
  },

  /**
   * Get a single profile by its _id.
   */
  getProfileById: async (profileId: string): Promise<CandidateProfile> => {
    const response = await apiClient.get<CandidateProfile>(`/candidates/profiles/${profileId}`);
    return (response as any).data ?? response;
  },

  /**
   * Create a new named profile.
   * @param profileName  Display name for the profile (e.g. "Fullstack", "Frontend")
   * @param cloneFromCandidateId  Optional: copy content from this profile's _id
   */
  createProfile: async (
    profileName: string,
    cloneFromCandidateId?: string,
  ): Promise<CandidateProfile> => {
    const response = await apiClient.post<ApiResponse<CandidateProfile>>(
      "/candidates/profiles",
      { profileName, ...(cloneFromCandidateId ? { cloneFromCandidateId } : {}) },
    );
    return (response as any).data ?? response;
  },

  /**
   * Update a specific profile.
   */
  updateProfileById: async (
    profileId: string,
    payload: Partial<CandidateProfile>,
  ): Promise<CandidateProfile> => {
    const response = await apiClient.patch<ApiResponse<CandidateProfile>>(
      `/candidates/profiles/${profileId}`,
      payload,
    );
    return (response as any).data ?? response;
  },

  /**
   * Set a profile as the user's default (used in the apply flow).
   */
  setDefault: async (profileId: string): Promise<void> => {
    await apiClient.post(`/candidates/profiles/${profileId}/set-default`);
  },

  /**
   * Delete a profile (cannot delete the last one).
   */
  deleteProfile: async (profileId: string): Promise<void> => {
    await apiClient.delete(`/candidates/profiles/${profileId}`);
  },

  // ─── Legacy single-profile helpers (kept for backward-compat) ───────────────

  getMyProfile: async (): Promise<CandidateProfile> => {
    const response: any = await apiClient.get("/candidates/profile");
    return response.data || response;
  },

  updateProfile: async (payload: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const response: any = await apiClient.patch<ApiResponse<CandidateProfile>>(
      "/candidates/profile",
      payload,
    );
    return response.data || response;
  },

  parseCvWithAi: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("cv", file);

    const res = await fetch(
      `${env.apiUrl}/candidates/parse-cv`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || "Không thể bóc tách CV.");
    }

    const result = await res.json();
    return result.data;
  },
};
