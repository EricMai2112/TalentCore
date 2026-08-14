import { CandidateJob, Department, Skill } from "../types/job.types";
import { env } from "@/src/config/env.config";

const API_BASE_URL = env.apiUrl;

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const candidateJobApi = {
  getPublicJobs: async (): Promise<CandidateJob[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/job-descriptions/public`, {
        cache: "no-store",
      });
      if (!res.ok) return [];
      const json: ApiResponse<CandidateJob[]> = await res.json();
      return json.data || [];
    } catch (error) {
      console.error("Failed to fetch candidate public jobs:", error);
      return [];
    }
  },

  getJobById: async (id: string): Promise<CandidateJob | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/job-descriptions/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json: ApiResponse<CandidateJob> = await res.json();
      return json.data || null;
    } catch (error) {
      console.error(`Failed to fetch job ${id}:`, error);
      return null;
    }
  },

  getDepartments: async (): Promise<Department[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/departments`, {
        cache: "no-store",
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      return [];
    }
  },

  getSkills: async (): Promise<Skill[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/skills`, {
        cache: "no-store",
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch (error) {
      console.error("Failed to fetch skills:", error);
      return [];
    }
  },
};
