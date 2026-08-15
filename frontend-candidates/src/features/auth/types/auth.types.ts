// frontend-candidates/src/features/auth/types/auth.types.ts
export interface CandidateUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: CandidateUser;
}