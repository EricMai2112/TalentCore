import { PipelineStage } from "@/src/features/job-description/types/job-description.types";

export interface KanbanCandidate {
  _id: string;
  fullName?: string;
  profileName?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface KanbanJobDescription {
  _id: string;
  title: string;
  departmentId?: {
    _id: string;
    name: string;
  } | string;
  positionId?: string;
  pipelineTemplateId?: {
    _id: string;
    name: string;
    stages: PipelineStage[];
  };
  requiredSkills?: Array<{ _id: string; name: string } | string>;
  interviewerIds?: Array<{ _id: string; name: string; email: string; role: string } | string>;
  interviewerId?: { _id: string; name: string; email: string; role: string } | string;
}

export interface KanbanApplication {
  _id: string;
  candidateId: KanbanCandidate;
  jobDescriptionId: KanbanJobDescription;
  currentStageId: string;
  appliedAt: string;
  aiFitScore?: number; // Mock AI score for UI display
  ratingScore?: number; // E.g. 3.25
  reviewStatus?: "Pending" | "Approved" | "Rejected";
}

export interface KanbanFilterParams {
  departmentId?: string;
  jobId?: string;
  search?: string;
  scoreFilter?: string; // "all" | "80" | "70" | "50"
}
