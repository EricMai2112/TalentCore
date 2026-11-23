export interface CandidateUser {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  status?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginResponse {
  access_token: string;
  user: CandidateUser;
  message?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordWithOtpPayload {
  email: string;
  otp: string;
  password: string;
  confirm_password: string;
}

export interface AuthMessageResponse {
  message: string;
  valid?: boolean;
}
