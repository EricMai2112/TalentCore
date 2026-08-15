// frontend-candidates/src/features/auth/services/auth.api.ts
import { apiClient } from "@/src/lib/api-client";
import { CandidateUser, LoginPayload, LoginResponse } from "../types/auth.types";

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  message: string;
}

export const authApi = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/login", data);
  },
  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>("/auth/register", data);
  },
  getMe: async (): Promise<CandidateUser> => {
    return apiClient.get<CandidateUser>("/auth/me");
  },
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};