import { apiClient } from "@/src/lib/api-client";
import {
  EmailTemplate,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
} from "../types/email-ai.types";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const emailAiApi = {
  getTemplates: async (): Promise<EmailTemplate[]> => {
    const res = await apiClient.get<ApiResponse<EmailTemplate[]>>("/email-templates");
    return res.data || [];
  },

  getTemplateById: async (id: string): Promise<EmailTemplate> => {
    const res = await apiClient.get<ApiResponse<EmailTemplate>>(`/email-templates/${id}`);
    return res.data;
  },

  createTemplate: async (data: CreateEmailTemplateDto): Promise<EmailTemplate> => {
    const res = await apiClient.post<ApiResponse<EmailTemplate>>("/email-templates", data);
    return res.data;
  },

  updateTemplate: async (id: string, data: UpdateEmailTemplateDto): Promise<EmailTemplate> => {
    const res = await apiClient.put<ApiResponse<EmailTemplate>>(`/email-templates/${id}`, data);
    return res.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/email-templates/${id}`);
  },
};
