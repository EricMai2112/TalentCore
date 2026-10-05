export interface JobItem {
  _id: string;
  title: string;
  department: string;
  departmentCode?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryDisplay?: string;
  currency?: string;
  location: string;
  workType: string;
  level: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  isUrgent?: boolean;
  skills: string[];
  postedTime?: string;
  createdAt?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  responsibilities?: string;
  experienceLevel?: string;
  employmentType?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  icon: string;
  count?: number;
  color?: string;
  bgColor?: string;
}

export interface ApplicationItem {
  _id: string;
  jobTitle: string;
  companyName: string;
  appliedDate: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  statusText: string;
  statusColor: string;
  location: string;
  salary: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'APPLICATION' | 'INTERVIEW' | 'OFFER' | 'SYSTEM';
}
