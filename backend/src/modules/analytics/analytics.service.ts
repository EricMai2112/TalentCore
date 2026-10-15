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
  ) {}

  private async getDepartmentJobIds(
    departmentId?: string,
  ): Promise<Types.ObjectId[] | null> {
    if (!departmentId || !Types.ObjectId.isValid(departmentId)) {
      return null;
    }
    const deptJobs = await this.jobDescriptionModel
      .find({ departmentId: new Types.ObjectId(departmentId) })
      .select('_id')
      .lean();
    return deptJobs.map((j) => j._id as Types.ObjectId);
  }

  // ─────────────────────────────────────────────────────────────
  // KPI TỔNG QUAN
  // ─────────────────────────────────────────────────────────────
  async getOverviewKpis(departmentId?: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const deptJobIds = await this.getDepartmentJobIds(departmentId);
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
    const jobDeptFilter = deptObjId ? { departmentId: deptObjId } : {};
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

    // 4. Offer Stats
    const offerDeptFilter = deptObjId
      ? {
          $or: [
            { departmentId: deptObjId },
            ...(hasDeptFilter ? [{ jobDescriptionId: { $in: deptJobIds } }] : []),
          ],
        }
      : {};

    const totalOffers = await this.offerModel.countDocuments(offerDeptFilter);
    const acceptedOffers = await this.offerModel.countDocuments({
      status: OfferStatus.ACCEPTED,
      ...offerDeptFilter,
    });
    const decidedOffers = await this.offerModel.countDocuments({
      status: {
        $in: [OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.EXPIRED],
      },
      ...offerDeptFilter,
    });
    const acceptanceRate =
      decidedOffers > 0
        ? Math.round((acceptedOffers / decidedOffers) * 100)
        : 0;
    const sentOffers = await this.offerModel.countDocuments({
      status: OfferStatus.SENT,
      ...offerDeptFilter,
    });

    // 5. Total Employees (non-candidate users)
    const totalEmployees = await this.userModel.countDocuments({
      role: { $ne: UserRole.CANDIDATE },
    });

    // 6. Time-to-Hire: tính avg ngày từ appliedAt → offer respondedAt
    const tthMatch: any = {
      status: OfferStatus.ACCEPTED,
      respondedAt: { $exists: true, $ne: null },
      ...offerDeptFilter,
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

    // 7. Pending Actions: offers SENT quá 3 ngày chưa phản hồi
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const overdueOffers = await this.offerModel.countDocuments({
      status: OfferStatus.SENT,
      sentAt: { $lt: threeDaysAgo },
      ...offerDeptFilter,
    });

    // 8. Interviews chưa có kết quả (COMPLETED nhưng result = PENDING)
    const pendingInterviewResults = await this.interviewModel.countDocuments({
      status: InterviewStatus.COMPLETED,
      result: InterviewResult.PENDING,
      ...intDeptFilter,
    });

    return {
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
  async getRecruitmentFunnel(departmentId?: string) {
    const deptJobIds = await this.getDepartmentJobIds(departmentId);
    const hasDeptFilter = deptJobIds !== null;
    const appFilter = hasDeptFilter
      ? { jobDescriptionId: { $in: deptJobIds } }
      : {};
    const intFilter = hasDeptFilter
      ? { jobDescriptionId: { $in: deptJobIds } }
      : {};
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;
    const offerFilter = deptObjId
      ? {
          $or: [
            { departmentId: deptObjId },
            ...(hasDeptFilter ? [{ jobDescriptionId: { $in: deptJobIds } }] : []),
          ],
        }
      : {};

    const totalApplications =
      await this.applicationModel.countDocuments(appFilter);

    let evaluatedApplications: number;
    if (hasDeptFilter) {
      const appIds = await this.applicationModel
        .find(appFilter)
        .select('_id')
        .lean();
      evaluatedApplications = await this.aiEvaluationModel.countDocuments({
        applicationId: { $in: appIds.map((a) => a._id) },
      });
    } else {
      evaluatedApplications = await this.aiEvaluationModel.countDocuments();
    }

    // Distinct applications that reached interview
    const interviewedAppIds = await this.interviewModel.distinct(
      'applicationId',
      intFilter,
    );
    const totalInterviewed = interviewedAppIds.length;

    // Distinct applications that got offers
    const offerAppIds = await this.offerModel.distinct(
      'applicationId',
      offerFilter,
    );
    const totalOffered = offerAppIds.length;

    // Applications hired
    const totalHired = await this.applicationModel.countDocuments({
      status: ApplicationStatus.HIRED,
      ...appFilter,
    });
    const acceptedOffers = await this.offerModel.countDocuments({
      status: OfferStatus.ACCEPTED,
      ...offerFilter,
    });
    const finalHired = Math.max(totalHired, acceptedOffers);

    // Helper: tỉ lệ so với tổng (%)
    const pct = (count: number) =>
      totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;

    // Helper: tỉ lệ chuyển đổi step-to-step (%)
    const convPct = (numerator: number, denominator: number) =>
      denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

    const screened = evaluatedApplications; // chỉ dùng số thực từ DB
    const interviewed = totalInterviewed;
    const offered = totalOffered;
    const hired = finalHired;

    const stages = [
      {
        id: 'applied',
        name: 'Tiếp nhận hồ sơ',
        count: totalApplications,
        percentage: 100,
        color: '#1261A6',
      },
      {
        id: 'ai_screened',
        name: 'Đánh giá AI & Sàng lọc',
        count: screened,
        percentage: pct(screened),
        color: '#2A95BF',
      },
      {
        id: 'interview',
        name: 'Đã Phỏng vấn',
        count: interviewed,
        percentage: pct(interviewed),
        color: '#6366F1',
      },
      {
        id: 'offer',
        name: 'Đề nghị nhận việc (Offer)',
        count: offered,
        percentage: pct(offered),
        color: '#F59E0B',
      },
      {
        id: 'hired',
        name: 'Trúng tuyển chính thức',
        count: hired,
        percentage: pct(hired),
        color: '#10B981',
      },
    ];

    // Tỉ lệ chuyển đổi từng bước (step-to-step conversion rate)
    const conversionRates = {
      appliedToScreened: convPct(screened, totalApplications),
      screenedToInterviewed: convPct(interviewed, screened),
      interviewedToOffered: convPct(offered, interviewed),
      offeredToHired: convPct(hired, offered),
      overallRate: convPct(hired, totalApplications),
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
      const jds = await this.jobDescriptionModel
        .find({ departmentId: dept._id })
        .select('_id headcount status')
        .lean();

      const targetHeadcount = jds.reduce(
        (sum, j) => sum + (j.headcount || 1),
        0,
      );
      const activeJobs = jds.filter(
        (j) =>
          j.status === JobStatus.JD_CREATED || j.status === JobStatus.APPROVED,
      ).length;

      const hiredCount = await this.offerModel.countDocuments({
        departmentId: dept._id,
        status: OfferStatus.ACCEPTED,
      });

      if (targetHeadcount === 0 && activeJobs === 0 && hiredCount === 0)
        continue;

      const effectiveTarget =
        targetHeadcount > 0
          ? targetHeadcount
          : activeJobs > 0
            ? activeJobs * 2
            : 5;
      const rate = Math.min(
        100,
        Math.round((hiredCount / effectiveTarget) * 100),
      );

      result.push({
        id: dept._id.toString(),
        name: dept.name,
        code: dept.code,
        targetHeadcount: effectiveTarget,
        hiredCount,
        activeJobs,
        percentage: rate,
      });
    }

    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // PHÂN TÍCH OFFER
  // ─────────────────────────────────────────────────────────────
  async getOfferBreakdown(departmentId?: string) {
    const deptJobIds = await this.getDepartmentJobIds(departmentId);
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;
    const offerDeptFilter = deptObjId
      ? {
          $or: [
            { departmentId: deptObjId },
            ...(deptJobIds !== null
              ? [{ jobDescriptionId: { $in: deptJobIds } }]
              : []),
          ],
        }
      : {};

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
  async getApplicationTrends(monthsCount = 6, departmentId?: string) {
    const now = new Date();
    const months: any[] = [];
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
  async getHiringVelocityMetrics(departmentId?: string) {
    const deptJobIds = await this.getDepartmentJobIds(departmentId);
    const hasDeptFilter = deptJobIds !== null;
    const deptObjId =
      departmentId && Types.ObjectId.isValid(departmentId)
        ? new Types.ObjectId(departmentId)
        : null;

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
}
