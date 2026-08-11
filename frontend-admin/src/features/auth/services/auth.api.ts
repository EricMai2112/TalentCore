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

export const authApi = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/login", data);
  },
  getMe: async (): Promise<User> => {
    return apiClient.get<User>("/auth/me");
  },
//   logout: async (): Promise<void> => {
//     await apiClient.post("/auth/logout");
//   },
};