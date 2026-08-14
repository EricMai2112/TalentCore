export enum UserRole {
  HR_ADMIN = "HR_ADMIN",
  EMPLOYEE = "EMPLOYEE",
  DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  departmentId?: string;
}

export interface UpdateEmployeeDto {
  name?: string;
  phone?: string;
  role?: UserRole;
  departmentId?: string;
}

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.HR_ADMIN]: "Quản trị nhân sự",
  [UserRole.DEPARTMENT_MANAGER]: "Trưởng phòng",
  [UserRole.EMPLOYEE]: "Nhân viên",
};

export const USER_ROLE_COLOR: Record<UserRole, string> = {
  [UserRole.HR_ADMIN]: "text-violet-600",
  [UserRole.DEPARTMENT_MANAGER]: "text-orange-500",
  [UserRole.EMPLOYEE]: "text-indigo-500",
};
