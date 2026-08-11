import { apiClient } from "@/src/lib/api-client";
import {
  PipelineTemplate,
  CreatePipelineTemplateDto,
  UpdatePipelineTemplateDto,
} from "../types/pipeline.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const pipelineApi = {
  getTemplates: async (): Promise<PipelineTemplate[]> => {
    const res = await apiClient.get<ApiResponse<PipelineTemplate[]>>("/pipeline-templates");
    return res.data || [];
  },

  getTemplateById: async (id: string): Promise<PipelineTemplate> => {
    const res = await apiClient.get<ApiResponse<PipelineTemplate>>(`/pipeline-templates/${id}`);
    return res.data;
  },

  createTemplate: async (data: CreatePipelineTemplateDto): Promise<PipelineTemplate> => {
    const res = await apiClient.post<ApiResponse<PipelineTemplate>>("/pipeline-templates", data);
    return res.data;
  },

  updateTemplate: async (id: string, data: UpdatePipelineTemplateDto): Promise<PipelineTemplate> => {
    const res = await apiClient.put<ApiResponse<PipelineTemplate>>(`/pipeline-templates/${id}`, data);
    return res.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/pipeline-templates/${id}`);
  },
};
