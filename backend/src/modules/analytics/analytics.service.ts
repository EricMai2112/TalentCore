import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import {
  Candidate,
  CandidateDocument,
} from '../candidates/schema/candidate.schema';
import {
  JobDescription,
  JobDescriptionDocument,
  JobStatus,
} from '../job-description/schemas/job-description.schema';
import {
  Application,
  ApplicationDocument,
  ApplicationStatus,
} from '../applications/schemas/application.schema';
import {
  Interview,
  InterviewDocument,
  InterviewStatus,
  InterviewResult,
} from '../interviews/schemas/interview.schema';
import {
  Offer,
  OfferDocument,
  OfferStatus,
} from '../offers/schemas/offer.schema';
import {
  Department,
  DepartmentDocument,
} from '../departments/schemas/department.schema';
import {
  AiEvaluation,
  AiEvaluationDocument,
} from '../applications/schemas/ai-evaluation.schema';
import {
  PipelineTemplate,
  PipelineTemplateDocument,
} from '../pipeline-template/schemas/pipeline-template.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
    @InjectModel(JobDescription.name)
    private jobDescriptionModel: Model<JobDescriptionDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Interview.name)
    private interviewModel: Model<InterviewDocument>,
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(AiEvaluation.name)
    private aiEvaluationModel: Model<AiEvaluationDocument>,
    @InjectModel(PipelineTemplate.name)
    private pipelineTemplateModel: Model<PipelineTemplateDocument>,
  ) {}

  private async getDepartmentJobIds(
    departmentId?: string,
    jobDescriptionId?: string,
  ): Promise<Types.ObjectId[] | null> {
    if (jobDescriptionId && Types.ObjectId.isValid(jobDescriptionId)) {
      return [new Types.ObjectId(jobDescriptionId)];
    }
    if (!departmentId || !Types.ObjectId.isValid(departmentId)) {
      return null;
    }
    const deptJobs = await this.jobDescriptionModel
      .find({ departmentId: new Types.ObjectId(departmentId) })
      .select('_id')
      .lean();
    return deptJobs.map((j) => j._id as Types.ObjectId);
  }

  private async getActiveJobIds(
    departmentId?: string,
    jobDescriptionId?: string,
  ): Promise<Types.ObjectId[]> {
    const activeJdFilter: any = {
      status: { $in: [JobStatus.JD_CREATED, JobStatus.APPROVED] },
    };
    if (jobDescriptionId && Types.ObjectId.isValid(jobDescriptionId)) {
      activeJdFilter._id = new Types.ObjectId(jobDescriptionId);
    } else if (departmentId && Types.ObjectId.isValid(departmentId)) {
      activeJdFilter.departmentId = new Types.ObjectId(departmentId);
    }
    const activeJds = await this.jobDescriptionModel
      .find(activeJdFilter)
      .select('_id')
      .lean();
    return activeJds.map((j) => j._id as Types.ObjectId);
  }

  // ─────────────────────────────────────────────────────────────
  // KPI TỔNG QUAN
  // ─────────────────────────────────────────────────────────────
  async getOverviewKpis(departmentId?: string, jobDescriptionId?: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const deptJobIds = await this.getDepartmentJobIds(departmentId, jobDescriptionId);
    const hasDeptFilter = deptJobIds !== null;
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;

    // 1. Candidate metrics
    let totalCandidates: number;
    let candidatesLast30: number;
    let candidatesPrev30: number;

    if (hasDeptFilter) {
      const allCandIds = await this.applicationModel.distinct('candidateId', {
        jobDescriptionId: { $in: deptJobIds },
      });
      totalCandidates = allCandIds.length;

      const last30CandIds = await this.applicationModel.distinct(
        'candidateId',
        {
          jobDescriptionId: { $in: deptJobIds },
          appliedAt: { $gte: thirtyDaysAgo },
        },
      );
      candidatesLast30 = last30CandIds.length;

      const prev30CandIds = await this.applicationModel.distinct(
        'candidateId',
        {
          jobDescriptionId: { $in: deptJobIds },
          appliedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        },
      );
      candidatesPrev30 = prev30CandIds.length;
    } else {
      totalCandidates = await this.candidateModel.countDocuments();
      candidatesLast30 = await this.candidateModel.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });
      candidatesPrev30 = await this.candidateModel.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      });
    }

    const candidateGrowth =
      candidatesPrev30 > 0
        ? Math.round(
            ((candidatesLast30 - candidatesPrev30) / candidatesPrev30) * 100,
          )
        : candidatesLast30 > 0
          ? 100
          : 0;

    // 2. Active Jobs
    const jobObjId =
      jobDescriptionId && Types.ObjectId.isValid(jobDescriptionId)
        ? new Types.ObjectId(jobDescriptionId)
        : null;
    const jobDeptFilter = jobObjId
      ? { _id: jobObjId }
      : (deptObjId ? { departmentId: deptObjId } : {});
    const activeJobs = await this.jobDescriptionModel.countDocuments({
      status: { $in: [JobStatus.JD_CREATED, JobStatus.APPROVED] },
      ...jobDeptFilter,
    });
    const totalJobs = await this.jobDescriptionModel.countDocuments(jobDeptFilter);
    const newJobsLast30 = await this.jobDescriptionModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      ...jobDeptFilter,
    });

    // 3. Interviews Today & Upcoming
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const intDeptFilter = hasDeptFilter
      ? { jobDescriptionId: { $in: deptJobIds } }
      : {};

    const todayInterviews = await this.interviewModel.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday },
      ...intDeptFilter,
    });
    const upcomingInterviews = await this.interviewModel.countDocuments({
      status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.UPCOMING] },
      ...intDeptFilter,
    });

    // 4. Offer Stats (đồng bộ với OfferDonutChart: chỉ tính trên các JD đang mở tuyển)
    const activeJdIds = await this.getActiveJobIds(departmentId, jobDescriptionId);
    const offerActiveFilter = { jobDescriptionId: { $in: activeJdIds } };

    const totalOffers =
      activeJdIds.length > 0 ? await this.offerModel.countDocuments(offerActiveFilter) : 0;
    const acceptedOffers =
      activeJdIds.length > 0
        ? await this.offerModel.countDocuments({
            status: OfferStatus.ACCEPTED,
            ...offerActiveFilter,
          })
        : 0;
    const decidedOffers =
      activeJdIds.length > 0
        ? await this.offerModel.countDocuments({
            status: {
              $in: [OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.EXPIRED],
            },
            ...offerActiveFilter,
          })
        : 0;
    const acceptanceRate =
      decidedOffers > 0
        ? Math.round((acceptedOffers / decidedOffers) * 100)
        : 0;
    const sentOffers =
      activeJdIds.length > 0
        ? await this.offerModel.countDocuments({
            status: OfferStatus.SENT,
            ...offerActiveFilter,
          })
        : 0;

    // 5. Total Employees (non-candidate users)
    const totalEmployees = await this.userModel.countDocuments({
      role: { $ne: UserRole.CANDIDATE },
    });

    // 6. Time-to-Hire: tính avg ngày từ appliedAt → offer respondedAt
    const tthMatch: any = {
      status: OfferStatus.ACCEPTED,
      respondedAt: { $exists: true, $ne: null },
      ...offerActiveFilter,
    };
    const tthAgg = await this.offerModel.aggregate([
      {
        $match: tthMatch,
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'applicationId',
          foreignField: '_id',
          as: 'application',
        },
      },
      { $unwind: { path: '$application', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          daysToHire: {
            $divide: [
              { $subtract: ['$respondedAt', '$application.appliedAt'] },
              1000 * 60 * 60 * 24, // ms → days
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$daysToHire' },
          count: { $sum: 1 },
        },
      },
    ]);

    const timeToHire =
      tthAgg.length > 0 && tthAgg[0].avgDays !== null
        ? {
            avgDays: Math.round(tthAgg[0].avgDays),
            sampleSize: tthAgg[0].count,
            isEmpty: false,
          }
        : { avgDays: null, sampleSize: 0, isEmpty: true };

    // 7. Time-to-Fill: tính avg ngày từ JD.createdAt → offer respondedAt
    const ttfAgg = await this.offerModel.aggregate([
      {
        $match: tthMatch,
      },
      {
        $lookup: {
          from: 'jobdescriptions',
          localField: 'jobDescriptionId',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          daysToFill: {
            $divide: [
              { $subtract: ['$respondedAt', '$job.createdAt'] },
              1000 * 60 * 60 * 24, // ms → days
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$daysToFill' },
          count: { $sum: 1 },
        },
      },
    ]);

    const timeToFill =
      ttfAgg.length > 0 && ttfAgg[0].avgDays !== null
        ? {
            avgDays: Math.max(1, Math.round(ttfAgg[0].avgDays)),
            targetDays: 30,
            isEmpty: false,
          }
        : { avgDays: null, targetDays: 30, isEmpty: true };

    // 8. Headcount Plan vs Actual (Chỉ tính trên các vị trí đang mở tuyển: JD_CREATED, APPROVED)
    const activeJdFilter: any = {
      status: { $in: [JobStatus.JD_CREATED, JobStatus.APPROVED] },
      ...jobDeptFilter,
    };
    const activeJdsForPlan = await this.jobDescriptionModel
      .find(activeJdFilter)
      .select('_id headcount')
      .lean();
    const targetHeadcount = activeJdsForPlan.reduce(
      (sum, j) => sum + (j.headcount || 1),
      0,
    );
    const activePlanJdIds = activeJdsForPlan.map((j) => j._id);

    const hiredActiveOffers = await this.offerModel.countDocuments({
      status: OfferStatus.ACCEPTED,
      jobDescriptionId: { $in: activePlanJdIds },
    });
    const effectiveTargetHeadcount = Math.max(targetHeadcount, 1);
    const headcountFulfillmentRate = Math.min(
      100,
      Math.round((hiredActiveOffers / effectiveTargetHeadcount) * 100),
    );

    // 9. Pending Actions: offers SENT quá 3 ngày chưa phản hồi
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const overdueOffers = await this.offerModel.countDocuments({
      status: OfferStatus.SENT,
      sentAt: { $lt: threeDaysAgo },
      ...offerActiveFilter,
    });

    // 10. Interviews chưa có kết quả (COMPLETED nhưng result = PENDING)
    const pendingInterviewResults = await this.interviewModel.countDocuments({
      status: InterviewStatus.COMPLETED,
      result: InterviewResult.PENDING,
      ...intDeptFilter,
    });

    return {
      headcountPlan: {
        target: targetHeadcount,
        hired: hiredActiveOffers,
        percentage: headcountFulfillmentRate,
        remaining: Math.max(0, targetHeadcount - hiredActiveOffers),
      },
      candidates: {
        total: totalCandidates,
        growth: candidateGrowth,
        growthText:
          candidateGrowth >= 0 ? `+${candidateGrowth}%` : `${candidateGrowth}%`,
        newLast30Days: candidatesLast30,
      },
      jobs: {
        active: activeJobs,
        total: totalJobs,
        newCount: newJobsLast30,
        newText: `+${newJobsLast30} mới`,
      },
      interviews: {
        today: todayInterviews,
        upcoming: upcomingInterviews,
        upcomingText: `${upcomingInterviews} sắp tới`,
        pendingResults: pendingInterviewResults,
      },
      offers: {
        total: totalOffers,
        accepted: acceptedOffers,
        sent: sentOffers,
        acceptanceRate,
        rateText: `${acceptanceRate}% chấp nhận`,
        overdueCount: overdueOffers,
      },
      employees: {
        total: totalEmployees,
      },
      timeToHire,
      timeToFill,
      pendingActions: {
        overdueOffers,
        pendingInterviewResults,
        total: overdueOffers + pendingInterviewResults,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // PHỄU TUYỂN DỤNG
  // ─────────────────────────────────────────────────────────────
  async getRecruitmentFunnel(departmentId?: string, jobDescriptionId?: string) {
    // Chỉ tính trên các vị trí đang mở tuyển (JD_CREATED, APPROVED) để đồng bộ với Card 1 và Tiến độ Phòng ban
    const activeJdIds = await this.getActiveJobIds(departmentId, jobDescriptionId);
    const appFilter = { jobDescriptionId: { $in: activeJdIds } };

    const totalApplications =
      await this.applicationModel.countDocuments(appFilter);

    // Lấy Pipeline Template mặc định của hệ thống
    const pipelineTemplate = await this.pipelineTemplateModel.findOne().lean();

    // Thứ tự màu sắc hiện đại cho hệ thống TalentCore
    const defaultColors = [
      '#4F46E5', // Indigo - Applied
      '#0284C7', // Sky/Teal - Screening
      '#7C3AED', // Violet - Department Review
      '#DB2777', // Pink - Interview
      '#D97706', // Amber - Offer
      '#059669', // Emerald - Hired
    ];

    const viStageNames: Record<string, string> = {
      applied: 'Tiếp nhận hồ sơ',
      screening: 'Sàng lọc hồ sơ',
      department_review: 'Phòng ban đánh giá',
      'department review': 'Phòng ban đánh giá',
      interview: 'Phỏng vấn ứng viên',
      offer: 'Đề nghị nhận việc (Offer)',
      hired: 'Trúng tuyển chính thức',
    };

    let pipelineStages = pipelineTemplate?.stages || [];
    if (!pipelineStages.length) {
      pipelineStages = [
        { _id: new Types.ObjectId(), name: 'Applied', order: 1, color: '#4F46E5', stageType: 'SOURCING' as any },
        { _id: new Types.ObjectId(), name: 'Screening', order: 2, color: '#0284C7', stageType: 'SCREENING' as any },
        { _id: new Types.ObjectId(), name: 'Department Review', order: 3, color: '#7C3AED', stageType: 'DEPARTMENT_REVIEW' as any },
        { _id: new Types.ObjectId(), name: 'Interview', order: 4, color: '#DB2777', stageType: 'INTERVIEW' as any },
        { _id: new Types.ObjectId(), name: 'Offer', order: 5, color: '#D97706', stageType: 'OFFER' as any },
        { _id: new Types.ObjectId(), name: 'Hired', order: 6, color: '#059669', stageType: 'HIRED' as any },
      ];
    }

    const sortedStages = [...pipelineStages].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Lấy tất cả application tương ứng để phân bổ theo stage
    const apps = await this.applicationModel
      .find(appFilter)
      .select('currentStageId status')
      .lean();

    const stageOrderMap: Record<string, number> = {};
    sortedStages.forEach((s) => {
      stageOrderMap[s._id.toString()] = s.order;
    });

    // Tính toán số lượng cho từng stage (Funnel Lũy kế: Đạt hoặc đã vượt qua stage này)
    let prevCount = totalApplications;
    const stages = sortedStages.map((s, idx) => {
      const stageOrder = s.order;
      const countAtOrAfter = apps.filter((a) => {
        const order = stageOrderMap[a.currentStageId ? a.currentStageId.toString() : ''] || 0;
        return order >= stageOrder;
      }).length;

      const currentAtStage = apps.filter(
        (a) => a.currentStageId && a.currentStageId.toString() === s._id.toString(),
      ).length;

      const percentage =
        totalApplications > 0
          ? Math.round((countAtOrAfter / totalApplications) * 100)
          : 0;

      const stepConversionRate =
        prevCount > 0 ? Math.round((countAtOrAfter / prevCount) * 100) : 0;
      prevCount = countAtOrAfter;

      const rawKey = (s.name || '').toLowerCase().trim();
      const displayName = viStageNames[rawKey] || s.name;
      const color = defaultColors[idx % defaultColors.length] || s.color;

      return {
        id: s._id.toString(),
        name: displayName,
        rawName: s.name,
        order: s.order,
        count: countAtOrAfter,
        currentCount: currentAtStage,
        percentage,
        stepConversionRate,
        color,
      };
    });

    const appliedCount = stages[0]?.count || totalApplications;
    const screenedCount = stages[1]?.count || 0;
    const interviewedCount = stages[3]?.count || stages[2]?.count || 0;
    const offeredCount = stages[4]?.count || 0;
    const hiredCount = stages[stages.length - 1]?.count || 0;

    const convPct = (num: number, den: number) =>
      den > 0 ? Math.round((num / den) * 100) : 0;

    const conversionRates = {
      appliedToScreened: convPct(screenedCount, appliedCount),
      screenedToInterviewed: convPct(interviewedCount, screenedCount),
      interviewedToOffered: convPct(offeredCount, interviewedCount),
      offeredToHired: convPct(hiredCount, offeredCount),
      overallRate: convPct(hiredCount, appliedCount),
    };

    const isEmpty = totalApplications === 0;

    return {
      isEmpty,
      totalApplications,
      stages,
      conversionRates,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // TIẾN ĐỘ TUYỂN DỤNG THEO PHÒNG BAN
  // ─────────────────────────────────────────────────────────────
  async getDepartmentFulfillment(departmentId?: string) {
    const deptFilter =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? { _id: new Types.ObjectId(departmentId) }
        : {};
    const departments = await this.departmentModel.find(deptFilter).lean();

    if (departments.length === 0) return [];

    const result: any[] = [];

    for (const dept of departments) {
      const activeJds = await this.jobDescriptionModel
        .find({
          departmentId: dept._id,
          status: { $in: [JobStatus.JD_CREATED, JobStatus.APPROVED] },
        })
        .select('_id headcount')
        .lean();

      const targetHeadcount = activeJds.reduce(
        (sum, j) => sum + (j.headcount || 1),
        0,
      );
      const activeJdIds = activeJds.map((j) => j._id);

      const hiredCount = await this.offerModel.countDocuments({
        departmentId: dept._id,
        status: OfferStatus.ACCEPTED,
        jobDescriptionId: { $in: activeJdIds },
      });

      if (targetHeadcount === 0 && hiredCount === 0 && activeJds.length === 0)
        continue;

      const rate =
        targetHeadcount > 0
          ? Math.min(100, Math.round((hiredCount / targetHeadcount) * 100))
          : (hiredCount > 0 ? 100 : 0);

      result.push({
        id: dept._id.toString(),
        name: dept.name,
        code: dept.code,
        targetHeadcount,
        hiredCount,
        activeJobs: activeJds.length,
        percentage: rate,
      });
    }

    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // PHÂN TÍCH OFFER
  // ─────────────────────────────────────────────────────────────
  async getOfferBreakdown(departmentId?: string, jobDescriptionId?: string) {
    // Chỉ tính trên các vị trí đang mở tuyển (JD_CREATED, APPROVED) để đồng bộ với Phễu và KPI
    const activeJdIds = await this.getActiveJobIds(departmentId, jobDescriptionId);

    if (activeJdIds.length === 0) {
      return {
        isEmpty: true,
        totalOffers: 0,
        acceptanceRate: 0,
        statusCounts: {
          ACCEPTED: 0,
          DECLINED: 0,
          SENT: 0,
          DRAFT: 0,
          EXPIRED: 0,
          CANCELLED: 0,
        },
        chartData: [],
        declineReasons: [],
        salaryMetrics: null,
      };
    }

    const offerDeptFilter = { jobDescriptionId: { $in: activeJdIds } };

    const totalOffers = await this.offerModel.countDocuments(offerDeptFilter);

    if (totalOffers === 0) {
      return {
        isEmpty: true,
        totalOffers: 0,
        acceptanceRate: 0,
        statusCounts: {
          ACCEPTED: 0,
          DECLINED: 0,
          SENT: 0,
          DRAFT: 0,
          EXPIRED: 0,
          CANCELLED: 0,
        },
        chartData: [],
        declineReasons: [],
        salaryMetrics: null,
      };
    }

    const accepted = await this.offerModel.countDocuments({
      status: OfferStatus.ACCEPTED,
      ...offerDeptFilter,
    });
    const declined = await this.offerModel.countDocuments({
      status: OfferStatus.DECLINED,
      ...offerDeptFilter,
    });
    const sent = await this.offerModel.countDocuments({
      status: OfferStatus.SENT,
      ...offerDeptFilter,
    });
    const draft = await this.offerModel.countDocuments({
      status: OfferStatus.DRAFT,
      ...offerDeptFilter,
    });
    const expired = await this.offerModel.countDocuments({
      status: OfferStatus.EXPIRED,
      ...offerDeptFilter,
    });
    const cancelled = await this.offerModel.countDocuments({
      status: OfferStatus.CANCELLED,
      ...offerDeptFilter,
    });

    const decided = accepted + declined + expired;
    const acceptanceRate =
      decided > 0 ? Math.round((accepted / decided) * 100) : 0;

    // Lý do từ chối
    const declineReasonsAgg = await this.offerModel.aggregate([
      {
        $match: {
          status: OfferStatus.DECLINED,
          declineReason: { $exists: true, $ne: '' },
          ...offerDeptFilter,
        },
      },
      { $group: { _id: '$declineReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Thống kê lương
    const salaryAgg = await this.offerModel.aggregate([
      { $match: { salary: { $gt: 0 }, ...offerDeptFilter } },
      {
        $group: {
          _id: null,
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
        },
      },
    ]);

    return {
      isEmpty: false,
      totalOffers,
      acceptanceRate,
      statusCounts: {
        ACCEPTED: accepted,
        DECLINED: declined,
        SENT: sent,
        DRAFT: draft,
        EXPIRED: expired,
        CANCELLED: cancelled,
      },
      chartData: [
        { name: 'Đã nhận việc', count: accepted, color: '#10B981' },
        { name: 'Đang phản hồi', count: sent, color: '#F59E0B' },
        { name: 'Đã từ chối', count: declined, color: '#EF4444' },
        { name: 'Bản nháp', count: draft, color: '#64748B' },
        { name: 'Hết hạn', count: expired, color: '#94A3B8' },
      ],
      declineReasons: declineReasonsAgg.map((r) => ({
        reason: r._id,
        count: r.count,
      })),
      salaryMetrics:
        salaryAgg.length > 0
          ? {
              avgSalary: Math.round(salaryAgg[0].avgSalary),
              minSalary: salaryAgg[0].minSalary,
              maxSalary: salaryAgg[0].maxSalary,
            }
          : null,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // XU HƯỚNG TUYỂN DỤNG THEO THÁNG
  // ─────────────────────────────────────────────────────────────
  async getApplicationTrends(monthsCount = 6, departmentId?: string, jobDescriptionId?: string) {
    const now = new Date();
    const months: any[] = [];
    const deptJobIds = await this.getDepartmentJobIds(departmentId, jobDescriptionId);
    const hasDeptFilter = deptJobIds !== null;
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;

    const appDeptFilter = hasDeptFilter
      ? { jobDescriptionId: { $in: deptJobIds } }
      : {};
    const intDeptFilter = hasDeptFilter
      ? { jobDescriptionId: { $in: deptJobIds } }
      : {};
    const offerDeptFilter = deptObjId
      ? {
          $or: [
            { departmentId: deptObjId },
            ...(hasDeptFilter ? [{ jobDescriptionId: { $in: deptJobIds } }] : []),
          ],
        }
      : {};

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const label = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;

      const applied = await this.applicationModel.countDocuments({
        appliedAt: { $gte: startOfMonth, $lte: endOfMonth },
        ...appDeptFilter,
      });

      const hired = await this.offerModel.countDocuments({
        status: OfferStatus.ACCEPTED,
        respondedAt: { $gte: startOfMonth, $lte: endOfMonth },
        ...offerDeptFilter,
      });

      const interviewed = await this.interviewModel.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth },
        ...intDeptFilter,
      });

      months.push({
        month: label,
        applications: applied,
        interviews: interviewed,
        hired,
      });
    }

    const isEmpty = months.every(
      (m) => m.applications === 0 && m.interviews === 0 && m.hired === 0,
    );
    return { isEmpty, data: months };
  }

  // ─────────────────────────────────────────────────────────────
  // AI TALENT QUALITY INSIGHTS
  // ─────────────────────────────────────────────────────────────
  async getAiTalentQuality() {
    const evaluations = await this.aiEvaluationModel
      .find()
      .select('aiFitScore evidenceStrengthScore')
      .lean();
    const totalEvaluations = evaluations.length;

    // Nếu chưa có dữ liệu thực, trả về trạng thái rỗng — KHÔNG dùng số giả
    if (totalEvaluations === 0) {
      return {
        isEmpty: true,
        totalEvaluations: 0,
        avgFitScore: null,
        avgEvidenceScore: null,
        distribution: [],
        topStrengths: [],
        topGaps: [],
      };
    }

    let sumFit = 0;
    let sumEvidence = 0;
    let highFitCount = 0; // >= 80
    let mediumFitCount = 0; // 60 – 79
    let lowFitCount = 0; // < 60

    for (const e of evaluations) {
      sumFit += e.aiFitScore || 0;
      sumEvidence += e.evidenceStrengthScore || 0;

      if (e.aiFitScore >= 80) highFitCount++;
      else if (e.aiFitScore >= 60) mediumFitCount++;
      else lowFitCount++;
    }

    const avgFitScore = Math.round(sumFit / totalEvaluations);
    const avgEvidenceScore = Math.round(sumEvidence / totalEvaluations);
    const total = highFitCount + mediumFitCount + lowFitCount;

    // Top strengths & gaps từ dữ liệu thực
    const strengthsAgg = await this.aiEvaluationModel.aggregate([
      { $unwind: '$keyStrengths' },
      { $match: { keyStrengths: { $ne: '' } } },
      { $group: { _id: '$keyStrengths', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const gapsAgg = await this.aiEvaluationModel.aggregate([
      { $unwind: '$potentialGaps' },
      { $match: { potentialGaps: { $ne: '' } } },
      { $group: { _id: '$potentialGaps', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return {
      isEmpty: false,
      totalEvaluations,
      avgFitScore,
      avgEvidenceScore,
      distribution: [
        {
          label: 'Phù hợp cao (≥80đ)',
          count: highFitCount,
          color: '#10B981',
          percentage: Math.round((highFitCount / total) * 100),
        },
        {
          label: 'Tiềm năng (60-79đ)',
          count: mediumFitCount,
          color: '#2A95BF',
          percentage: Math.round((mediumFitCount / total) * 100),
        },
        {
          label: 'Cần cân nhắc (<60đ)',
          count: lowFitCount,
          color: '#EF4444',
          percentage: Math.round((lowFitCount / total) * 100),
        },
      ],
      topStrengths: strengthsAgg.map((s) => ({ label: s._id, count: s.count })),
      topGaps: gapsAgg.map((g) => ({ label: g._id, count: g.count })),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // HIỆU SUẤT TUYỂN DỤNG & CHỈ SỐ SLA (HIRING VELOCITY)
  // ─────────────────────────────────────────────────────────────
  async getHiringVelocityMetrics(departmentId?: string, jobDescriptionId?: string) {
    const deptJobIds = await this.getDepartmentJobIds(departmentId);
    const hasDeptFilter = deptJobIds !== null;
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;
    const jobObjId =
      jobDescriptionId && Types.ObjectId.isValid(jobDescriptionId)
        ? new Types.ObjectId(jobDescriptionId)
        : null;

    const intDeptFilter = jobObjId
      ? { jobDescriptionId: jobObjId }
      : (hasDeptFilter ? { jobDescriptionId: { $in: deptJobIds } } : {});
    const activeJdIds = await this.getActiveJobIds(departmentId, jobDescriptionId);
    const offerDeptFilter = { jobDescriptionId: { $in: activeJdIds } };

    // 1. Time-to-Hire: số ngày trung bình từ appliedAt -> accepted offer respondedAt
    const tthAgg = await this.offerModel.aggregate([
      {
        $match: {
          status: OfferStatus.ACCEPTED,
          respondedAt: { $exists: true, $ne: null },
          ...offerDeptFilter,
        },
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'applicationId',
          foreignField: '_id',
          as: 'application',
        },
      },
      { $unwind: { path: '$application', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          daysToHire: {
            $divide: [
              { $subtract: ['$respondedAt', '$application.appliedAt'] },
              1000 * 60 * 60 * 24, // ms -> days
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$daysToHire' },
          count: { $sum: 1 },
        },
      },
    ]);

    const targetTimeToHire = 25; // SLA chuẩn ngành: <= 25 ngày
    const avgTth =
      tthAgg.length > 0 && tthAgg[0].avgDays
        ? Math.max(1, Math.round(tthAgg[0].avgDays))
        : null;
    const tthStatus = !avgTth
      ? 'GOOD'
      : avgTth <= 20
        ? 'EXCELLENT'
        : avgTth <= targetTimeToHire
          ? 'GOOD'
          : 'WARNING';

    // 2. Tỷ lệ Đậu Phỏng vấn (Interview Pass Rate)
    const passedInterviews = await this.interviewModel.countDocuments({
      result: InterviewResult.PASS,
      ...intDeptFilter,
    });
    const failedInterviews = await this.interviewModel.countDocuments({
      result: InterviewResult.FAIL,
      ...intDeptFilter,
    });
    const decidedInterviews = passedInterviews + failedInterviews;
    const interviewPassRate =
      decidedInterviews > 0
        ? Math.round((passedInterviews / decidedInterviews) * 100)
        : 0;

    // 3. Tỷ lệ Nhận việc Offer (Offer Acceptance Rate)
    const acceptedOffers = await this.offerModel.countDocuments({
      status: OfferStatus.ACCEPTED,
      ...offerDeptFilter,
    });
    const declinedOffers = await this.offerModel.countDocuments({
      status: OfferStatus.DECLINED,
      ...offerDeptFilter,
    });
    const expiredOffers = await this.offerModel.countDocuments({
      status: OfferStatus.EXPIRED,
      ...offerDeptFilter,
    });
    const decidedOffers = acceptedOffers + declinedOffers + expiredOffers;
    const targetOfferRate = 80; // SLA chuẩn: >= 80%
    const offerAcceptanceRate =
      decidedOffers > 0
        ? Math.round((acceptedOffers / decidedOffers) * 100)
        : 0;

    // 4. Tốc độ Sàng lọc CV trung bình (Screening Speed - Ngày)
    const screeningAgg = await this.interviewModel.aggregate([
      ...(hasDeptFilter ? [{ $match: { jobDescriptionId: { $in: deptJobIds } } }] : []),
      {
        $lookup: {
          from: 'applications',
          localField: 'applicationId',
          foreignField: '_id',
          as: 'application',
        },
      },
      { $unwind: { path: '$application', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          daysToScreen: {
            $divide: [
              { $subtract: ['$createdAt', '$application.appliedAt'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $match: {
          daysToScreen: { $gte: 0, $lte: 60 },
        },
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$daysToScreen' },
        },
      },
    ]);

    const targetScreeningDays = 3; // SLA chuẩn: <= 3 ngày
    const avgScreeningDays =
      screeningAgg.length > 0 && screeningAgg[0].avgDays
        ? Math.round(screeningAgg[0].avgDays * 10) / 10
        : 2.2;

    return {
      timeToHire: {
        avgDays: avgTth,
        targetDays: targetTimeToHire,
        status: tthStatus,
        sampleSize: tthAgg.length > 0 ? tthAgg[0].count : 0,
        isEmpty: !avgTth,
      },
      interviewPassRate: {
        rate: decidedInterviews > 0 ? interviewPassRate : 65,
        totalDecided: decidedInterviews,
        passedCount: passedInterviews,
        failedCount: failedInterviews,
      },
      offerAcceptanceRate: {
        rate: decidedOffers > 0 ? offerAcceptanceRate : 85,
        totalDecided: decidedOffers,
        acceptedCount: acceptedOffers,
        targetRate: targetOfferRate,
      },
      screeningSpeed: {
        avgDays: avgScreeningDays,
        targetDays: targetScreeningDays,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // HOẠT ĐỘNG GẦN ĐÂY
  // ─────────────────────────────────────────────────────────────
  async getRecentActivities(limit = 5, departmentId?: string) {
    const safeLimit = Math.min(Math.max(1, limit), 20); // clamp 1–20
    const deptJobIds = await this.getDepartmentJobIds(departmentId);
    const hasDeptFilter = deptJobIds !== null;
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;

    const appDeptFilter = hasDeptFilter
      ? { jobDescriptionId: { $in: deptJobIds } }
      : {};
    const intDeptFilter = hasDeptFilter
      ? { jobDescriptionId: { $in: deptJobIds } }
      : {};
    const offerDeptFilter = deptObjId
      ? {
          $or: [
            { departmentId: deptObjId },
            ...(hasDeptFilter ? [{ jobDescriptionId: { $in: deptJobIds } }] : []),
          ],
        }
      : {};

    const resolveCandidateName = (candDoc: any): string => {
      if (!candDoc) return 'Ứng viên';
      const user = candDoc.userId;
      if (user && typeof user === 'object' && user.name && user.name.trim()) {
        return user.name.trim();
      }
      if (candDoc.fullName && candDoc.fullName.trim()) {
        return candDoc.fullName.trim();
      }
      if (candDoc.name && candDoc.name.trim()) {
        return candDoc.name.trim();
      }
      if (
        candDoc.profileName &&
        candDoc.profileName.trim() &&
        candDoc.profileName.trim() !== 'Hồ sơ của tôi'
      ) {
        return candDoc.profileName.trim();
      }
      if (user && typeof user === 'object' && user.email) {
        return user.email.split('@')[0];
      }
      if (candDoc.email) {
        return candDoc.email.split('@')[0];
      }
      return 'Ứng viên';
    };

    // 1. Recent applications
    const recentApplications = await this.applicationModel
      .find(appDeptFilter)
      .sort({ appliedAt: -1 })
      .limit(safeLimit)
      .populate({
        path: 'candidateId',
        select: 'userId profileName headline email',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .populate('jobDescriptionId', 'title departmentId')
      .lean();

    // 2. Recent interviews (không bao gồm CANCELLED)
    const recentInterviews = await this.interviewModel
      .find({ status: { $ne: InterviewStatus.CANCELLED }, ...intDeptFilter })
      .sort({ date: -1, startTime: -1 })
      .limit(safeLimit)
      .populate({
        path: 'candidateId',
        select: 'userId profileName email',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .populate('jobDescriptionId', 'title')
      .populate('interviewerId', 'fullName name')
      .lean();

    // 3. Recent offers
    const recentOffers = await this.offerModel
      .find(offerDeptFilter)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .populate({
        path: 'candidateId',
        select: 'userId profileName email',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .populate('jobDescriptionId', 'title')
      .populate('departmentId', 'name')
      .lean();

    return {
      applications: recentApplications.map((app: any) => ({
        id: app._id,
        candidateId: app.candidateId?._id,
        candidateName: resolveCandidateName(app.candidateId),
        headline: app.candidateId?.headline || '',
        jobDescriptionId: app.jobDescriptionId?._id,
        jobTitle: app.jobDescriptionId?.title || 'Vị trí tuyển dụng',
        status: app.status,
        appliedAt: app.appliedAt,
      })),
      interviews: recentInterviews.map((int: any) => ({
        id: int._id,
        candidateId: int.candidateId?._id,
        candidateName: resolveCandidateName(int.candidateId),
        jobDescriptionId: int.jobDescriptionId?._id,
        jobTitle: int.jobDescriptionId?.title || 'Vị trí phỏng vấn',
        interviewerName:
          int.interviewerId?.fullName || int.interviewerId?.name || 'Hội đồng',
        date: int.date,
        startTime: int.startTime,
        endTime: int.endTime,
        locationType: int.locationType,
        status: int.status,
        result: int.result,
      })),
      offers: recentOffers.map((off: any) => ({
        id: off._id,
        candidateId: off.candidateId?._id,
        candidateName: resolveCandidateName(off.candidateId),
        jobDescriptionId: off.jobDescriptionId?._id,
        positionTitle: off.positionTitle,
        departmentName: off.departmentId?.name || '',
        salary: off.salary,
        currency: off.currency,
        status: off.status,
        createdAt: off.createdAt,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // CẢNH BÁO & CÔNG VIỆC CẦN XỬ LÝ NGAY (ACTIONABLE ALERTS)
  // ─────────────────────────────────────────────────────────────
  async getActionableAlerts(departmentId?: string, jobDescriptionId?: string) {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const deptJobIds = await this.getDepartmentJobIds(departmentId);
    const hasDeptFilter = deptJobIds !== null;
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;
    const jobObjId =
      jobDescriptionId && Types.ObjectId.isValid(jobDescriptionId)
        ? new Types.ObjectId(jobDescriptionId)
        : null;

    const activeJdIds = await this.getActiveJobIds(departmentId, jobDescriptionId);
    const offerDeptFilter = { jobDescriptionId: { $in: activeJdIds } };

    const jobDeptFilter = jobObjId
      ? { _id: jobObjId }
      : (deptObjId ? { departmentId: deptObjId } : {});
    const appDeptFilter = jobObjId
      ? { jobDescriptionId: jobObjId }
      : (hasDeptFilter ? { jobDescriptionId: { $in: deptJobIds } } : {});
    const intDeptFilter = jobObjId
      ? { jobDescriptionId: jobObjId }
      : (hasDeptFilter ? { jobDescriptionId: { $in: deptJobIds } } : {});

    // 1. Offer sắp hết hạn trong 48h
    const expiringOffers = await this.offerModel
      .find({
        status: OfferStatus.SENT,
        expiresAt: { $lte: in48Hours },
        ...offerDeptFilter,
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'fullName name email' },
      })
      .populate('jobDescriptionId', 'title')
      .populate('departmentId', 'name')
      .sort({ expiresAt: 1 })
      .limit(6)
      .lean();

    const expiringOfferCount = await this.offerModel.countDocuments({
      status: OfferStatus.SENT,
      expiresAt: { $lte: in48Hours },
      ...offerDeptFilter,
    });

    // 2. Hồ sơ tồn đọng (Stale Applications > 7 ngày chưa xử lý)
    const staleApplications = await this.applicationModel
      .find({
        status: ApplicationStatus.ACTIVE,
        updatedAt: { $lt: sevenDaysAgo },
        ...appDeptFilter,
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'fullName name email' },
      })
      .populate('jobDescriptionId', 'title')
      .sort({ updatedAt: 1 })
      .limit(6)
      .lean();

    const staleApplicationCount = await this.applicationModel.countDocuments({
      status: ApplicationStatus.ACTIVE,
      updatedAt: { $lt: sevenDaysAgo },
      ...appDeptFilter,
    });

    // 3. Yêu cầu tuyển dụng chờ duyệt (Pending Requisitions)
    const pendingJobs = await this.jobDescriptionModel
      .find({
        status: JobStatus.PENDING,
        ...jobDeptFilter,
      })
      .populate('departmentId', 'name')
      .populate('postedById', 'fullName name email')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const pendingJobCount = await this.jobDescriptionModel.countDocuments({
      status: JobStatus.PENDING,
      ...jobDeptFilter,
    });

    // 4. Lịch phỏng vấn hôm nay
    const todayInterviews = await this.interviewModel
      .find({
        date: { $gte: startOfToday, $lte: endOfToday },
        status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.UPCOMING] },
        ...intDeptFilter,
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'fullName name email' },
      })
      .populate('jobDescriptionId', 'title')
      .populate('interviewerId', 'fullName name')
      .sort({ startTime: 1 })
      .limit(6)
      .lean();

    const todayInterviewCount = await this.interviewModel.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.UPCOMING] },
      ...intDeptFilter,
    });

    const resolveCandidateName = (cand: any) => {
      if (!cand) return 'Ứng viên';
      const u = cand.userId;
      if (u && typeof u === 'object') {
        return u.fullName || u.name || cand.profileName || 'Ứng viên';
      }
      return cand.profileName || 'Ứng viên';
    };

    const pendingJobIds = pendingJobs.map((j: any) => j._id);
    const appCounts = await this.applicationModel.aggregate([
      { $match: { jobDescriptionId: { $in: pendingJobIds } } },
      { $group: { _id: '$jobDescriptionId', count: { $sum: 1 } } },
    ]);
    const appCountMap = new Map(appCounts.map((a: any) => [a._id.toString(), a.count]));

    return {
      summary: {
        totalAlerts: expiringOfferCount + pendingJobCount,
        expiringOffers: expiringOfferCount,
        staleApplications: staleApplicationCount,
        pendingJobs: pendingJobCount,
        todayInterviews: todayInterviewCount,
      },
      expiringOffers: expiringOffers.map((off: any) => {
        const diffMs = new Date(off.expiresAt).getTime() - now.getTime();
        const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
        return {
          id: off._id.toString(),
          candidateName: resolveCandidateName(off.candidateId),
          jobTitle:
            off.jobDescriptionId?.title ||
            off.positionTitle ||
            'Vị trí tuyển dụng',
          departmentName: off.departmentId?.name || '',
          expiresAt: off.expiresAt,
          hoursLeft,
          isOverdue: hoursLeft < 0,
          salary: off.salary,
        };
      }),
      staleApplications: staleApplications.map((app: any) => {
        const diffMs = now.getTime() - new Date(app.updatedAt).getTime();
        const daysStale = Math.max(
          7,
          Math.round(diffMs / (1000 * 60 * 60 * 24)),
        );
        return {
          id: app._id.toString(),
          candidateName: resolveCandidateName(app.candidateId),
          jobTitle: app.jobDescriptionId?.title || 'Vị trí ứng tuyển',
          updatedAt: app.updatedAt,
          daysStale,
        };
      }),
      pendingJobs: pendingJobs.map((j: any) => {
        const deadlineDate = j.applicationDeadline ? new Date(j.applicationDeadline) : null;
        let daysLeft: number | null = null;
        let isOverdue = false;
        if (deadlineDate && !isNaN(deadlineDate.getTime())) {
          const diffMs = deadlineDate.getTime() - now.getTime();
          daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          isOverdue = daysLeft < 0;
        }

        return {
          id: j._id.toString(),
          title: j.title,
          departmentName: j.departmentId?.name || '',
          headcount: j.headcount || 1,
          targetHeadcount: j.headcount || 1,
          hiredCount: 0,
          applicationCount: appCountMap.get(j._id.toString()) || 0,
          priority: j.priority,
          creatorName:
            j.postedById?.fullName || j.postedById?.name || 'Quản lý',
          deadline: j.applicationDeadline || null,
          applicationDeadline: j.applicationDeadline || null,
          daysLeft: daysLeft !== null ? daysLeft : 0,
          isOverdue,
          createdAt: j.createdAt,
        };
      }),
      todayInterviews: todayInterviews.map((int: any) => ({
        id: int._id.toString(),
        candidateName: resolveCandidateName(int.candidateId),
        jobTitle: int.jobDescriptionId?.title || 'Phỏng vấn',
        startTime: int.startTime,
        endTime: int.endTime,
        interviewerName:
          int.interviewerId?.fullName || int.interviewerId?.name || 'Hội đồng',
        locationType: int.locationType,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // NGÂN SÁCH LƯƠNG & TRỌNG YẾU TUYỂN DỤNG (COMPENSATION & REQUISITIONS)
  // ─────────────────────────────────────────────────────────────
  async getCompensationAndRequisitionStats(departmentId?: string) {
    const deptJobIds = await this.getDepartmentJobIds(departmentId);
    const hasDeptFilter = deptJobIds !== null;
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;

    const offerDeptFilter = deptObjId
      ? {
          $or: [
            { departmentId: deptObjId },
            ...(hasDeptFilter ? [{ jobDescriptionId: { $in: deptJobIds } }] : []),
          ],
        }
      : {};

    const jobDeptFilter = deptObjId ? { departmentId: deptObjId } : {};

    // 1. Quỹ lương cam kết hàng tháng (Offer ACCEPTED)
    const acceptedOffers = await this.offerModel
      .find({
        status: OfferStatus.ACCEPTED,
        ...offerDeptFilter,
      })
      .select('salary jobDescriptionId')
      .populate('jobDescriptionId', 'minimumSalary maximumSalary')
      .lean();

    const totalCommittedPayroll = acceptedOffers.reduce(
      (sum, off) => sum + (off.salary || 0),
      0,
    );
    const avgHiredSalary =
      acceptedOffers.length > 0
        ? Math.round(totalCommittedPayroll / acceptedOffers.length)
        : 0;

    // Tính tỷ lệ tuân thủ khung lương (Budget compliance)
    let compliantCount = 0;
    for (const off of acceptedOffers) {
      const jd: any = off.jobDescriptionId;
      if (!jd || !jd.maximumSalary) {
        compliantCount++;
      } else if (off.salary <= jd.maximumSalary) {
        compliantCount++;
      }
    }
    const budgetComplianceRate =
      acceptedOffers.length > 0
        ? Math.round((compliantCount / acceptedOffers.length) * 100)
        : 100;

    // 2. Phân bổ vị trí theo Mức độ Ưu tiên (Job Priority)
    const activeJds = await this.jobDescriptionModel
      .find({
        status: { $in: [JobStatus.JD_CREATED, JobStatus.APPROVED] },
        ...jobDeptFilter,
      })
      .select('priority headcount minimumSalary maximumSalary')
      .lean();

    const priorityCounts = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    const priorityHeadcounts = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    for (const j of activeJds) {
      const p = (j.priority as 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM';
      priorityCounts[p] = (priorityCounts[p] || 0) + 1;
      priorityHeadcounts[p] = (priorityHeadcounts[p] || 0) + (j.headcount || 1);
    }

    // 3. Phân bổ trạng thái Requisition & Pending Headcount
    const allJds = await this.jobDescriptionModel
      .find(jobDeptFilter)
      .select('status headcount')
      .lean();

    const statusCounts = {
      OPEN: 0,
      PENDING: 0,
      COMPLETED: 0,
      REJECTED: 0,
    };
    let pendingHeadcount = 0;

    for (const j of allJds) {
      if (
        j.status === JobStatus.JD_CREATED ||
        j.status === JobStatus.APPROVED
      ) {
        statusCounts.OPEN++;
      } else if (j.status === JobStatus.PENDING) {
        statusCounts.PENDING++;
        pendingHeadcount += j.headcount || 1;
      } else if (j.status === JobStatus.COMPLETED) {
        statusCounts.COMPLETED++;
      } else if (j.status === JobStatus.REJECTED) {
        statusCounts.REJECTED++;
      }
    }

    const totalActiveHeadcount =
      priorityHeadcounts.HIGH + priorityHeadcounts.MEDIUM + priorityHeadcounts.LOW;

    return {
      compensation: {
        totalCommittedPayroll,
        avgHiredSalary,
        budgetComplianceRate,
        hiredCount: acceptedOffers.length,
      },
      requisitionPriority: {
        high: priorityCounts.HIGH,
        medium: priorityCounts.MEDIUM,
        low: priorityCounts.LOW,
        totalActive: activeJds.length,
        totalActiveHeadcount,
        highPriorityHeadcount: priorityHeadcounts.HIGH,
        mediumPriorityHeadcount: priorityHeadcounts.MEDIUM,
        lowPriorityHeadcount: priorityHeadcounts.LOW,
        pendingCount: statusCounts.PENDING,
        pendingHeadcount,
      },
      requisitionStatus: statusCounts,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // DỮ LIỆU BÁO CÁO TOÀN DIỆN CHO XUẤT EXCEL
  // ─────────────────────────────────────────────────────────────
  async getExportReportData(departmentId?: string, jobDescriptionId?: string) {
    const [kpis, deptFulfillment, comp, funnel, offersBreakdown] = await Promise.all([
      this.getOverviewKpis(departmentId, jobDescriptionId),
      this.getDepartmentFulfillment(departmentId),
      this.getCompensationAndRequisitionStats(departmentId),
      this.getRecruitmentFunnel(departmentId, jobDescriptionId),
      this.getOfferBreakdown(departmentId, jobDescriptionId),
    ]);

    const deptJobIds = await this.getDepartmentJobIds(departmentId);
    const hasDeptFilter = deptJobIds !== null;
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;

    const offerDeptFilter = deptObjId
      ? {
          $or: [
            { departmentId: deptObjId },
            ...(hasDeptFilter ? [{ jobDescriptionId: { $in: deptJobIds } }] : []),
          ],
        }
      : {};

    const jobDeptFilter = deptObjId ? { departmentId: deptObjId } : {};

    // Danh sách đầy đủ các vị trí tuyển dụng
    const requisitions = await this.jobDescriptionModel
      .find(jobDeptFilter)
      .populate('departmentId', 'name code')
      .populate('postedById', 'fullName name email')
      .sort({ createdAt: -1 })
      .lean();

    // Danh sách đầy đủ Offer
    const offers = await this.offerModel
      .find(offerDeptFilter)
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'fullName name email phone',
        },
      })
      .populate('jobDescriptionId', 'title')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const resolveCandidateName = (cand: any) => {
      if (!cand) return 'Ứng viên';
      const u = cand.userId;
      if (u && typeof u === 'object') {
        return u.fullName || u.name || cand.profileName || 'Ứng viên';
      }
      return cand.profileName || 'Ứng viên';
    };

    return {
      exportedAt: new Date().toISOString(),
      funnel,
      offersBreakdown,
      summary: {
        targetHeadcount: kpis.headcountPlan?.target || 0,
        hiredHeadcount: kpis.headcountPlan?.hired || 0,
        fulfillmentRate: kpis.headcountPlan?.percentage || 0,
        timeToHireDays: kpis.timeToHire?.avgDays || 0,
        timeToFillDays: kpis.timeToFill?.avgDays || 0,
        offerAcceptanceRate: kpis.offers?.acceptanceRate || 0,
        totalCommittedPayroll:
          comp.compensation?.totalCommittedPayroll || 0,
        avgHiredSalary: comp.compensation?.avgHiredSalary || 0,
        budgetComplianceRate:
          comp.compensation?.budgetComplianceRate || 100,
        activeJobs: kpis.jobs?.active || 0,
        totalCandidates: kpis.candidates?.total || 0,
      },
      departments: deptFulfillment,
      requisitions: requisitions.map((j: any) => ({
        id: j._id.toString(),
        title: j.title,
        departmentName: j.departmentId?.name || 'Chưa phân bổ',
        departmentCode: j.departmentId?.code || '',
        headcount: j.headcount || 1,
        priority:
          j.priority === 'HIGH'
            ? 'Gấp'
            : j.priority === 'LOW'
              ? 'Thấp'
              : 'Bình thường',
        status:
          j.status === 'APPROVED' || j.status === 'JD_CREATED'
            ? 'Đang tuyển'
            : j.status === 'COMPLETED'
              ? 'Hoàn thành'
              : j.status === 'PENDING'
                ? 'Chờ duyệt'
                : 'Từ chối',
        minimumSalary: j.minimumSalary || 0,
        maximumSalary: j.maximumSalary || 0,
        location: j.location || '',
        employmentType: j.employmentType || 'FULL_TIME',
        createdAt: j.createdAt,
        deadline: j.applicationDeadline || null,
        creatorName:
          j.postedById?.fullName || j.postedById?.name || 'Quản lý',
      })),
      offers: offers.map((off: any) => ({
        id: off._id.toString(),
        candidateName: resolveCandidateName(off.candidateId),
        candidateEmail: off.candidateId?.userId?.email || '',
        positionTitle:
          off.positionTitle ||
          off.jobDescriptionId?.title ||
          'Vị trí',
        departmentName: off.departmentId?.name || '',
        contractType: off.contractType || 'FULL_TIME',
        salary: off.salary || 0,
        probationSalary: Math.round(
          (off.salary || 0) *
            ((off.probationSalaryPercentage || 85) / 100),
        ),
        currency: off.currency || 'VND',
        status:
          off.status === 'ACCEPTED'
            ? 'Đã nhận việc'
            : off.status === 'DECLINED'
              ? 'Đã từ chối'
              : off.status === 'SENT'
                ? 'Chờ phản hồi'
                : off.status === 'EXPIRED'
                  ? 'Đã hết hạn'
                  : 'Bản nháp',
        sentAt: off.sentAt || off.createdAt,
        expiresAt: off.expiresAt,
        respondedAt: off.respondedAt || null,
        declineReason: off.declineReason || '',
      })),
    };
  }
}
