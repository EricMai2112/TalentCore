export type CategoryType = 'TECHNICAL' | 'SOFT_SKILLS' | 'CULTURE_FIT' | 'OTHER';

export interface CriteriaScoreItem {
  id: string;
  name: string;
  category: CategoryType;
  score: number; // 1 - 5
  weight: number; // default 1
  comment?: string;
}

export type RecommendationType = 'STRONG_HIRE' | 'HIRE' | 'CONSIDER' | 'NO_HIRE';

export interface InterviewEvaluationData {
  _id?: string;
  interviewId: string;
  applicationId?: string;
  candidateId?: string;
  jobDescriptionId?: string;
  interviewerId?: any;
  isDraft: boolean;
  criteriaScores: CriteriaScoreItem[];
  overallScore: number;
  strengths?: string;
  weaknesses?: string;
  recommendation?: RecommendationType;
  generalFeedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_EVALUATION_CRITERIA: CriteriaScoreItem[] = [
  {
    id: 'crit_1',
    name: 'Kiến thức chuyên môn & Kinh nghiệm',
    category: 'TECHNICAL',
    score: 0,
    weight: 1.5,
    comment: '',
  },
  {
    id: 'crit_2',
    name: 'Kỹ năng giải quyết vấn đề & Tư duy logic',
    category: 'TECHNICAL',
    score: 0,
    weight: 1.2,
    comment: '',
  },
  {
    id: 'crit_3',
    name: 'Kỹ năng giao tiếp & Trình bày',
    category: 'SOFT_SKILLS',
    score: 0,
    weight: 1.0,
    comment: '',
  },
  {
    id: 'crit_4',
    name: 'Khả năng làm việc nhóm & Thích ứng',
    category: 'SOFT_SKILLS',
    score: 0,
    weight: 1.0,
    comment: '',
  },
  {
    id: 'crit_5',
    name: 'Mức độ phù hợp văn hóa doanh nghiệp',
    category: 'CULTURE_FIT',
    score: 0,
    weight: 1.0,
    comment: '',
  },
  {
    id: 'crit_6',
    name: 'Thái độ & Trách nhiệm công việc',
    category: 'CULTURE_FIT',
    score: 0,
    weight: 1.0,
    comment: '',
  },
];
