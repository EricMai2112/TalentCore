import { apiClient } from "@/src/lib/api-client";
import {
  Skill,
  CreateSkillDto,
  PositionWithSkills,
  CreatePositionDto,
  UpdatePositionDto,
  DeptOption,
} from "../types/skill.types";

interface MsgResponse {
  message: string;
  skill?: Skill;
  position?: PositionWithSkills;
}

// ── Skills ────────────────────────────────────────────────────────────────

export const skillApi = {
  getAll: async (): Promise<Skill[]> => {
    const res = await apiClient.get<Skill[]>("/skills");
    return res || [];
  },

  create: async (data: CreateSkillDto): Promise<Skill> => {
    const res = await apiClient.post<MsgResponse>("/skills", data);
    return res.skill as Skill;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/skills/${id}`);
  },
};

// ── Positions ─────────────────────────────────────────────────────────────

export const positionApi = {
  /** Returns positions populated with departmentId + skillIds */
  getWithSkills: async (): Promise<PositionWithSkills[]> => {
    const res = await apiClient.get<PositionWithSkills[]>("/positions/with-skills");
    return res || [];
  },

  create: async (data: CreatePositionDto): Promise<PositionWithSkills> => {
    const res = await apiClient.post<MsgResponse>("/positions", data);
    return res.position as PositionWithSkills;
  },

  update: async (id: string, data: UpdatePositionDto): Promise<PositionWithSkills> => {
    const res = await apiClient.patch<MsgResponse>(`/positions/${id}`, data);
    return res.position as PositionWithSkills;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/positions/${id}`);
  },

  addSkill: async (positionId: string, skillId: string): Promise<void> => {
    await apiClient.post(`/positions/${positionId}/skills/${skillId}`, {});
  },

  removeSkill: async (positionId: string, skillId: string): Promise<void> => {
    await apiClient.delete(`/positions/${positionId}/skills/${skillId}`);
  },
};

// ── Departments (reuse existing endpoint) ─────────────────────────────────

export const deptOptionApi = {
  getAll: async (): Promise<DeptOption[]> => {
    const res = await apiClient.get<DeptOption[]>("/departments");
    return res || [];
  },
};
