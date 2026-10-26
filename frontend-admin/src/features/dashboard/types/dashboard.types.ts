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

export interface HeadcountPlan {
  target: number;
  hired: number;
  percentage: number;
  remaining: number;
}

export interface TimeToFill {
  avgDays: number | null;
  targetDays: number;
  isEmpty: boolean;
}

export interface OverviewKpis {
  headcountPlan: HeadcountPlan;
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
  timeToFill: TimeToFill;
  pendingActions: PendingActions;
}

// ─── FUNNEL ──────────────────────────────────────────────────────────────────
export interface FunnelStage {
  id: string;
  name: string;
  rawName?: string;
  order?: number;
  count: number;
  currentCount?: number;
  percentage: number;
  stepConversionRate?: number;
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

// ─── HIRING VELOCITY & SLA ───────────────────────────────────────────────────
export interface HiringVelocityMetrics {
  timeToHire: {
    avgDays: number | null;
    targetDays: number;
    status: 'EXCELLENT' | 'GOOD' | 'WARNING';
    sampleSize: number;
    isEmpty: boolean;
  };
  interviewPassRate: {
    rate: number;
    totalDecided: number;
    passedCount: number;
    failedCount: number;
  };
  offerAcceptanceRate: {
    rate: number;
    totalDecided: number;
    acceptedCount: number;
    targetRate: number;
  };
  screeningSpeed: {
    avgDays: number;
    targetDays: number;
  };
}

// ─── ACTIONABLE ALERTS ───────────────────────────────────────────────────────
export interface ExpiringOfferAlert {
  id: string;
  candidateName: string;
  jobTitle: string;
  departmentName: string;
  expiresAt: string;
  hoursLeft: number;
  isOverdue: boolean;
  salary: number;
}

export interface StaleApplicationAlert {
  id: string;
  candidateName: string;
  jobTitle: string;
  updatedAt: string;
  daysStale: number;
}

export interface PendingJobAlert {
  id: string;
  title: string;
  departmentName: string;
  headcount: number;
  priority: string;
  creatorName: string;
  createdAt: string;
}

export interface TodayInterviewAlert {
  id: string;
  candidateName: string;
  jobTitle: string;
  startTime: string;
  endTime: string;
  interviewerName: string;
  locationType: string;
}

export interface ActionableAlerts {
  summary: {
    totalAlerts: number;
    expiringOffers: number;
    staleApplications: number;
    pendingJobs: number;
    todayInterviews: number;
  };
  expiringOffers: ExpiringOfferAlert[];
  staleApplications: StaleApplicationAlert[];
  pendingJobs: PendingJobAlert[];
  todayInterviews: TodayInterviewAlert[];
}

// ─── COMPENSATION & REQUISITIONS ─────────────────────────────────────────────
export interface CompensationStats {
  totalCommittedPayroll: number;
  avgHiredSalary: number;
  budgetComplianceRate: number;
  hiredCount: number;
}

export interface RequisitionPriorityStats {
  high: number;
  medium: number;
  low: number;
  totalActive: number;
  totalActiveHeadcount?: number;
  highPriorityHeadcount: number;
  mediumPriorityHeadcount?: number;
  lowPriorityHeadcount?: number;
  pendingCount?: number;
  pendingHeadcount?: number;
}

export interface RequisitionStatusCounts {
  OPEN: number;
  PENDING: number;
  COMPLETED: number;
  REJECTED: number;
}

export interface CompensationAndRequisitions {
  compensation: CompensationStats;
  requisitionPriority: RequisitionPriorityStats;
  requisitionStatus: RequisitionStatusCounts;
}

// ─── EXPORT REPORT DATA ──────────────────────────────────────────────────────
export interface ExportReportData {
  exportedAt: string;
  summary: {
    targetHeadcount: number;
    hiredHeadcount: number;
    fulfillmentRate: number;
    timeToHireDays: number;
    timeToFillDays: number;
    offerAcceptanceRate: number;
    totalCommittedPayroll: number;
    avgHiredSalary: number;
    budgetComplianceRate: number;
    activeJobs: number;
    totalCandidates: number;
  };
  departments: DepartmentFulfillment[];
  requisitions: {
    id: string;
    title: string;
    departmentName: string;
    departmentCode: string;
    headcount: number;
    priority: string;
    status: string;
    minimumSalary: number;
    maximumSalary: number;
    location: string;
    employmentType: string;
    createdAt: string;
    deadline: string | null;
    creatorName: string;
  }[];
  offers: {
    id: string;
    candidateName: string;
    candidateEmail: string;
    positionTitle: string;
    departmentName: string;
    contractType: string;
    salary: number;
    probationSalary: number;
    currency: string;
    status: string;
    sentAt: string;
    expiresAt: string;
    respondedAt: string | null;
    declineReason: string;
  }[];
}

// ─── COMBINED ────────────────────────────────────────────────────────────────
export interface DashboardData {
  kpis: OverviewKpis;
  funnel?: RecruitmentFunnel;
  departmentFulfillment: DepartmentFulfillment[];
  offers: OfferBreakdown;
  trends: ApplicationTrends;
  velocity: HiringVelocityMetrics;
  activities: RecentActivities;
  alerts: ActionableAlerts;
  compensation: CompensationAndRequisitions;
}
