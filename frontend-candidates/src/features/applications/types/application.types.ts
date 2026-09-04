export interface PipelineStageInfo {
  _id: string;
  name: string;
  color: string;
  order: number;
}

export interface AppliedJobDescription {
  _id: string;
  title: string;
  salaryRange?: string;
  location?: string;
  departmentId?: {
    _id: string;
    name: string;
  };
}

export interface CandidateApplicationItem {
  _id: string;
  candidateId: any;
  jobDescriptionId: AppliedJobDescription;
  currentStageId: string;
  appliedAt: string;
  stageName: string;
  stageColor?: string;
  currentStageIndex: number;
  stages: PipelineStageInfo[];
  aiFitScore?: number | null;
  aiEvaluation?: any;
}

export interface ApplicationStats {
  totalApplied: number;
  processingCount: number;
  interviewCount: number;
  offerCount: number;
}

export interface MyApplicationsResponseData {
  applications: CandidateApplicationItem[];
  stats: ApplicationStats;
}
