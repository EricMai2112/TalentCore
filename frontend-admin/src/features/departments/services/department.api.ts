import { apiClient } from "@/src/lib/api-client";
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "../types/department.types";

interface MutationResponse {
  message: string;
  department?: Department;
}

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const res = await apiClient.get<Department[]>("/departments");
    return res || [];
  },

  getById: async (id: string): Promise<Department> => {
    return apiClient.get<Department>(`/departments/${id}`);
  },

  create: async (data: CreateDepartmentDto): Promise<Department> => {
    const res = await apiClient.post<MutationResponse>("/departments", data);
    return res.department as Department;
  },

  update: async (id: string, data: UpdateDepartmentDto): Promise<Department> => {
    const res = await apiClient.patch<MutationResponse>(`/departments/${id}`, data);
    return res.department as Department;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
  },
};
