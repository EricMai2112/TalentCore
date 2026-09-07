import { PipelineStage } from "@/src/features/job-description/types/job-description.types";

export interface EvaluatedCriterion {
  name: string;
  requirementType: "MANDATORY" | "PREFERRED" | string;
  weight: number;
  score: number;
  scoreContribution: number;
  evidence: string;
  isEvidenceVerified: boolean;
  evidenceStrengthScore?: number;
  isPassed: boolean;
}

export interface AiEvaluationData {
  _id?: string;
  applicationId?: string;
  aiFitScore: number;
  evidenceStrengthScore?: number;
  isMissingMandatory: boolean;
  warnings?: string[];
  summary?: string;
  keyStrengths?: string[];
  potentialGaps?: string[];
  suggestedQuestions?: string[];
  evaluatedCriteria?: EvaluatedCriterion[];
  evaluatedAt?: string;
}

export interface CandidateExperience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
}

export interface CandidateEducation {
  institution: string;
  degree?: string;
  major?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
}

export interface CandidateProject {
  name: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  projectUrl?: string;
  technologies?: string[];
}

export interface CandidateSkill {
  name: string;
  proficiency?: string;
  yearsOfExperience?: number;
}

export interface KanbanCandidate {
  _id: string;
  fullName?: string;
  profileName?: string;
  headline?: string;
  summary?: string;
  careerObjective?: string;
  address?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  yearsOfExperience?: number;
  currentLevel?: string;
  skills?: Array<CandidateSkill | string>;
  experiences?: CandidateExperience[];
  educations?: CandidateEducation[];
  projects?: CandidateProject[];
  certifications?: Array<{ name: string; organization?: string; issueDate?: string }>;
  languages?: Array<{ language: string; proficiency?: string }>;
  socialLinks?: Array<{ platform: string; url: string }>;
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
  aiFitScore?: number;
  evidenceStrengthScore?: number;
  isMissingMandatory?: boolean;
  ratingScore?: number;
  reviewStatus?: "Pending" | "Approved" | "Rejected";
  aiEvaluation?: AiEvaluationData;
}

export interface KanbanFilterParams {
  departmentId?: string;
  jobId?: string;
  search?: string;
  scoreFilter?: string; // "all" | "80" | "70" | "50"
}
