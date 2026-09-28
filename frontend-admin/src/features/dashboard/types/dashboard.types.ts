// ─── KPIs ────────────────────────────────────────────────────────────────────
export interface TimeToHire {
  avgDays: number | null;
  sampleSize: number;
  isEmpty: boolean;
}

export interface PendingActions {
  overdueOffers: number;
  pendingInterviewResults: number;
  total: number;
}

export interface OverviewKpis {
  candidates: {
    total: number;
    growth: number;
    growthText: string;
    newLast30Days: number;
  };
  jobs: {
    active: number;
    total: number;
    newCount: number;
    newText: string;
  };
  interviews: {
    today: number;
    upcoming: number;
    upcomingText: string;
    pendingResults: number;
  };
  offers: {
    total: number;
    accepted: number;
    sent: number;
    acceptanceRate: number;
    rateText: string;
    overdueCount: number;
  };
  employees: { total: number };
  timeToHire: TimeToHire;
  pendingActions: PendingActions;
}

// ─── FUNNEL ──────────────────────────────────────────────────────────────────
export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ConversionRates {
  appliedToScreened: number;
  screenedToInterviewed: number;
  interviewedToOffered: number;
  offeredToHired: number;
  overallRate: number;
}

export interface RecruitmentFunnel {
  isEmpty: boolean;
  totalApplications: number;
  stages: FunnelStage[];
  conversionRates: ConversionRates;
}

// ─── DEPARTMENT ──────────────────────────────────────────────────────────────
export interface DepartmentFulfillment {
  id: string;
  name: string;
  code: string;
  targetHeadcount: number;
  hiredCount: number;
  activeJobs: number;
  percentage: number;
}

// ─── OFFERS ──────────────────────────────────────────────────────────────────
export interface OfferChartItem {
  name: string;
  count: number;
  color: string;
}

export interface SalaryMetrics {
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
}

export interface OfferBreakdown {
  isEmpty: boolean;
  totalOffers: number;
  acceptanceRate: number;
  statusCounts: Record<string, number>;
  chartData: OfferChartItem[];
  declineReasons: { reason: string; count: number }[];
  salaryMetrics: SalaryMetrics | null;
}

// ─── TRENDS ──────────────────────────────────────────────────────────────────
export interface TrendMonth {
  month: string;
  applications: number;
  interviews: number;
  hired: number;
}

export interface ApplicationTrends {
  isEmpty: boolean;
  data: TrendMonth[];
}

// ─── AI INSIGHTS ─────────────────────────────────────────────────────────────
export interface AiDistributionItem {
  label: string;
  count: number;
  color: string;
  percentage: number;
}

export interface AiInsights {
  isEmpty: boolean;
  totalEvaluations: number;
  avgFitScore: number | null;
  avgEvidenceScore: number | null;
  distribution: AiDistributionItem[];
  topStrengths: { label: string; count: number }[];
  topGaps: { label: string; count: number }[];
}

// ─── ACTIVITIES ──────────────────────────────────────────────────────────────
export interface RecentApplication {
  id: string;
  candidateId: string;
  candidateName: string;
  headline: string;
  jobDescriptionId: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
}

export interface RecentInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobDescriptionId: string;
  jobTitle: string;
  interviewerName: string;
  date: string;
  startTime: string;
  endTime: string;
  locationType: string;
  status: string;
  result: string;
}

export interface RecentOffer {
  id: string;
  candidateId: string;
  candidateName: string;
  jobDescriptionId: string;
  positionTitle: string;
  departmentName: string;
  salary: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface RecentActivities {
  applications: RecentApplication[];
  interviews: RecentInterview[];
  offers: RecentOffer[];
}

// ─── COMBINED ────────────────────────────────────────────────────────────────
export interface DashboardData {
  kpis: OverviewKpis;
  funnel: RecruitmentFunnel;
  departmentFulfillment: DepartmentFulfillment[];
  offers: OfferBreakdown;
  trends: ApplicationTrends;
  aiInsights: AiInsights;
  activities: RecentActivities;
}
