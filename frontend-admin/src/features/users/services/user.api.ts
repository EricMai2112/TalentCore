import { apiClient } from "@/src/lib/api-client";
import { User, Department, CreateEmployeeDto, UpdateEmployeeDto, UserStatus } from "../types/user.types";

interface ApiResponse<T> {
  message: string;
  user?: T;
  data?: T;
}

export const userApi = {
  getEmployees: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>("/users/employees");
    return res || [];
  },

  createEmployee: async (data: CreateEmployeeDto): Promise<User> => {
    const res = await apiClient.post<ApiResponse<User>>("/users/employees", data);
    return res.user as User;
  },

  updateEmployee: async (id: string, data: UpdateEmployeeDto): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/employees/${id}`, data);
    return res.user as User;
  },

  toggleStatus: async (id: string, status: UserStatus): Promise<void> => {
    await apiClient.patch(`/users/employees/${id}/status`, { status });
  },

  getDepartments: async (): Promise<Department[]> => {
    const res = await apiClient.get<Department[]>("/departments");
    return res || [];
  },
};
