// src/features/auth/services/auth.api.ts
import { apiClient } from "@/src/lib/api-client";
import { User } from "@/src/features/users/types/user.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export const authApi = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>("/auth/login", data);
    if (res?.access_token && typeof document !== "undefined") {
      // Sync cookie to the frontend Next.js domain so middleware & SSR can access it
      document.cookie = `accessToken=${res.access_token}; path=/; max-age=86400; SameSite=Lax`;
    }
    return res;
  },
  getMe: async (): Promise<User> => {
    return apiClient.get<User>("/auth/me");
  },
  changePassword: async (data: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
    return apiClient.patch<ChangePasswordResponse>("/auth/change-password", data);
  },
  updateProfile: async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
    return apiClient.patch<UpdateProfileResponse>("/users/profile", data);
  },
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout", {});
    } finally {
      if (typeof document !== "undefined") {
        document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      }
    }
  },
};