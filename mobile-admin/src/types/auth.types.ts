export enum UserRole {
  HR_ADMIN = 'HR_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  CANDIDATE = 'CANDIDATE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
}

export interface Department {
  _id: string;
  name: string;
  code: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  departmentId?: string | Department;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  message?: string;
}
