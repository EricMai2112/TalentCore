export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export enum JobStatus {
  PENDING = 'PENDING',       // Chờ duyệt
  APPROVED = 'APPROVED',     // Đã duyệt
  REJECTED = 'REJECTED',     // Từ chối
  JD_CREATED = 'JD_CREATED', // Đã tạo JD
}

export enum JobPriority {
  HIGH = 'HIGH',       // Gấp
  MEDIUM = 'MEDIUM',   // Bình thường
  LOW = 'LOW',         // Thấp
}

export interface Department {
  _id: string;
  name: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Skill {
  _id: string;
  name: string;
  aliases?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineStage {
  _id?: string;
  name: string;
  order: number;
  color: string;
}

export interface PipelineTemplate {
  _id: string;
  name: string;
  stages: PipelineStage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  departmentId?: string;
}

export interface Position {
  _id: string;
  name: string;
  departmentId: string | Department;
  skillIds?: (string | Skill)[];
}

export interface JobDescription {
  _id: string;
  pipelineTemplateId: string | PipelineTemplate;
  departmentId: string | Department;
  positionId?: string;
  interviewerId?: string | User;
  title: string;
  location: string;
  employmentType: EmploymentType;
  minimumSalary: number;
  maximumSalary: number;
  requiredSkills: (string | Skill)[];
  experienceLevel: string;
  description: string;
  requirements: string;
  benefits: string;
  status: JobStatus;
  note?: string;
  priority: JobPriority;
  postedById?: string | User;
  headcount: number;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobDescriptionDto {
  pipelineTemplateId: string;
  departmentId: string;
  positionId?: string;
  interviewerId?: string;
  title: string;
  location: string;
  employmentType: EmploymentType;
  minimumSalary: number;
  maximumSalary: number;
  requiredSkills?: string[];
  experienceLevel: string;
  description: string;
  requirements: string;
  benefits: string;
  status?: JobStatus;
  note?: string;
  priority?: JobPriority;
  postedById?: string;
  headcount?: number;
  applicationDeadline?: string;
}

export interface UpdateJobDescriptionDto {
  pipelineTemplateId?: string;
  departmentId?: string;
  positionId?: string;
  interviewerId?: string;
  title?: string;
  location?: string;
  employmentType?: EmploymentType;
  minimumSalary?: number;
  maximumSalary?: number;
  requiredSkills?: string[];
  experienceLevel?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  status?: JobStatus;
  note?: string;
  priority?: JobPriority;
  postedById?: string;
  headcount?: number;
  applicationDeadline?: string;
}
