export interface CandidateNote {
  _id?: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface StageInfo {
  _id: string;
  name: string;
  color: string;
  order: number;
}

export interface CandidateUser {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface CandidateProfileData {
  _id: string;
  profileName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  headline?: string;
  currentLevel?: string;
  address?: string;
  summary?: string;
  careerObjective?: string;
  userId?: CandidateUser;
  experiences?: any[];
  educations?: any[];
  projects?: any[];
  skills?: any[];
  certifications?: any[];
  languages?: any[];
  customSections?: any[];
  socialLinks?: any[];
}

export interface JobDepartment {
  _id: string;
  name: string;
  code?: string;
}

export interface JobInterviewer {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface JobDescriptionData {
  _id: string;
  title: string;
  departmentId?: JobDepartment | string;
  pipelineTemplateId?: {
    _id: string;
    name: string;
    stages: StageInfo[];
  };
  interviewerId?: JobInterviewer;
  interviewerIds?: JobInterviewer[];
}

export interface CandidateApplication {
  _id: string;
  candidateId: CandidateProfileData;
  jobDescriptionId: JobDescriptionData;
  currentStageId: string;
  appliedAt: string;
  aiFitScore?: number | null;
  isMissingMandatory?: boolean;
  notes?: CandidateNote[];
  aiEvaluation?: any;
  stageName?: string;
  stageColor?: string;
}
