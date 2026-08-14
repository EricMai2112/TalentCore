export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export enum JobPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Department {
  _id: string;
  name: string;
  code?: string;
}

export interface Skill {
  _id: string;
  name: string;
  category?: string;
}

export interface PipelineStage {
  name: string;
  order: number;
}

export interface PipelineTemplate {
  _id: string;
  name: string;
  stages: PipelineStage[];
}

export interface CandidateJob {
  _id: string;
  title: string;
  departmentId: Department | string;
  location: string;
  employmentType: EmploymentType;
  minimumSalary: number;
  maximumSalary: number;
  requiredSkills: (Skill | string)[];
  experienceLevel: string;
  description: string;
  requirements: string;
  benefits: string;
  priority: JobPriority;
  headcount: number;
  applicationDeadline?: string;
  pipelineTemplateId?: PipelineTemplate | string;
  createdAt?: string;
  updatedAt?: string;
  isNew?: boolean;
}

export interface JobFilterState {
  keyword: string;
  employmentType: string;
  experienceLevel: string;
  location: string;
  minSalary: string;
}
