// frontend-candidates/src/features/auth/services/auth.api.ts
import { apiClient } from "@/src/lib/api-client";
import { CandidateUser, LoginPayload, LoginResponse } from "../types/auth.types";

export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyForgotPasswordPayload {
  token: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirm_password: string;
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
  forgotPassword: async (data: ForgotPasswordPayload): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/forgot-password", data);
  },
  verifyForgotPassword: async (data: VerifyForgotPasswordPayload): Promise<{ valid: boolean; email: string }> => {
    return apiClient.post<{ valid: boolean; email: string }>("/auth/verify-forgot-password", data);
  },
  resetPassword: async (data: ResetPasswordPayload): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/reset-password", data);
  },
};