export interface CandidateUserRef {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
}

export interface EducationItem {
  institution: string;
  degree?: string;
  major?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
}

export interface ProjectItem {
  name: string;
  role?: string;
  description?: string;
  technologies?: string[];
  projectUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface SkillItem {
  skillId?: string;
  name: string;
  proficiency?: string;
  yearsOfExperience?: number;
}

export interface CertificateItem {
  name: string;
  organization?: string;
  scoreOrLevel?: string;
  issueDate?: string;
}

export interface LanguageItem {
  language: string;
  proficiency?: string;
}

export interface CustomSectionItem {
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  url?: string;
}

export interface CustomSection {
  sectionTitle: string;
  items: CustomSectionItem[];
}

export interface SocialLinkItem {
  platform: string;
  url: string;
}

export interface CandidateProfile {
  _id: string;
  userId: CandidateUserRef;
  profileName: string;
  isDefault: boolean;
  headline?: string;
  summary?: string;
  careerObjective?: string;
  yearsOfExperience?: number;
  currentLevel?: string;
  address?: string;
  cvPdfUrl?: string;
  socialLinks?: SocialLinkItem[];
  skills: SkillItem[];
  experiences: ExperienceItem[];
  educations: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificateItem[];
  languages: LanguageItem[];
  customSections: CustomSection[];
  createdAt?: string;
  updatedAt?: string;
}