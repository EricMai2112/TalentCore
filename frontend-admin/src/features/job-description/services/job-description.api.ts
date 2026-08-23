import { apiClient } from "@/src/lib/api-client";
import {
  JobDescription,
  CreateJobDescriptionDto,
  UpdateJobDescriptionDto,
  Department,
  Skill,
  PipelineTemplate,
  User,
  Position,
} from "../types/job-description.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const jobDescriptionApi = {
  getJobs: async (): Promise<JobDescription[]> => {
    const res = await apiClient.get<ApiResponse<JobDescription[]>>("/job-descriptions");
    return res.data || [];
  },

  getJobById: async (id: string): Promise<JobDescription> => {
    const res = await apiClient.get<ApiResponse<JobDescription>>(`/job-descriptions/${id}`);
    return res.data;
  },

  createJob: async (data: CreateJobDescriptionDto): Promise<JobDescription> => {
    const res = await apiClient.post<ApiResponse<JobDescription>>("/job-descriptions", data);
    return res.data;
  },

  updateJob: async (id: string, data: UpdateJobDescriptionDto): Promise<JobDescription> => {
    const res = await apiClient.put<ApiResponse<JobDescription>>(`/job-descriptions/${id}`, data);
    return res.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/job-descriptions/${id}`);
  },

  suggestCriteriaWeightsWithAi: async (payload: {
    positionTitle?: string;
    experienceLevel?: string;
    departmentName?: string;
    criteria: any[];
  }): Promise<{
    suggestedWeights: { index: number; name: string; weight: number }[];
    reasoning: string;
  }> => {
    const res = await apiClient.post<ApiResponse<{
      suggestedWeights: { index: number; name: string; weight: number }[];
      reasoning: string;
    }>>("/job-descriptions/ai-suggest-weights", payload);
    return res.data;
  },

  // Auxiliary data fetchers
  getDepartments: async (): Promise<Department[]> => {
    try {
      const res = await apiClient.get<any>("/departments");
      return res.data || res || [];
    } catch {
      return [];
    }
  },

  getSkills: async (): Promise<Skill[]> => {
    try {
      const res = await apiClient.get<any>("/skills");
      return res.data || res || [];
    } catch {
      return [];
    }
  },

  getPipelineTemplates: async (): Promise<PipelineTemplate[]> => {
    try {
      const res = await apiClient.get<any>("/pipeline-templates");
      return res.data || res || [];
    } catch {
      return [];
    }
  },

  getEmployees: async (): Promise<User[]> => {
    try {
      const res = await apiClient.get<any>("/users/employees");
      return res.data || res || [];
    } catch {
      return [];
    }
  },

  getPositions: async (): Promise<Position[]> => {
    try {
      const res = await apiClient.get<any>("/positions");
      return res.data || res || [];
    } catch {
      return [];
    }
  },
};
