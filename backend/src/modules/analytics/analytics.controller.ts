import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  async getOverviewKpis() {
    const data = await this.analyticsService.getOverviewKpis();
    return {
      message: 'Lấy chỉ số KPI tổng quan thành công',
      data,
    };
  }

  @Get('recruitment-funnel')
  async getRecruitmentFunnel() {
    const data = await this.analyticsService.getRecruitmentFunnel();
    return {
      message: 'Lấy dữ liệu phễu tuyển dụng thành công',
      data,
    };
  }

  @Get('department-fulfillment')
  async getDepartmentFulfillment() {
    const data = await this.analyticsService.getDepartmentFulfillment();
    return {
      message: 'Lấy tiến độ tuyển dụng theo phòng ban thành công',
      data,
    };
  }

  @Get('offers-breakdown')
  async getOfferBreakdown() {
    const data = await this.analyticsService.getOfferBreakdown();
    return {
      message: 'Lấy phân tích đề nghị tuyển dụng thành công',
      data,
    };
  }

  /**
   * ?months=6  — số tháng cần lấy xu hướng (mặc định 6, tối đa 24)
   * ?departmentId — lọc theo phòng ban (tùy chọn)
   */
  @Get('timeline-trends')
  async getTimelineTrends(
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number,
    @Query('departmentId') departmentId?: string,
    @Query('jobDescriptionId') jobDescriptionId?: string,
  ) {
    const safeMonths = Math.min(Math.max(1, months), 24);
    const cleanDeptId =
      departmentId && departmentId.trim() && departmentId !== 'ALL'
        ? departmentId.trim()
        : undefined;
    const cleanJobId =
      jobDescriptionId && jobDescriptionId.trim() && jobDescriptionId !== 'ALL'
        ? jobDescriptionId.trim()
        : undefined;
    const data = await this.analyticsService.getApplicationTrends(safeMonths, cleanDeptId, cleanJobId);
    return {
      message: 'Lấy xu hướng tuyển dụng theo thời gian thành công',
      data,
    };
  }

  @Get('ai-insights')
  async getAiInsights() {
    const data = await this.analyticsService.getAiTalentQuality();
    return {
      message: 'Lấy dữ liệu đánh giá chất lượng AI thành công',
      data,
    };
  }

  @Get('hiring-velocity')
  async getHiringVelocity(
    @Query('departmentId') departmentId?: string,
    @Query('jobDescriptionId') jobDescriptionId?: string,
  ) {
    const cleanDeptId =
      departmentId && departmentId.trim() && departmentId !== 'ALL'
        ? departmentId.trim()
        : undefined;
    const cleanJobId =
      jobDescriptionId && jobDescriptionId.trim() && jobDescriptionId !== 'ALL'
        ? jobDescriptionId.trim()
        : undefined;
    const data = await this.analyticsService.getHiringVelocityMetrics(cleanDeptId, cleanJobId);
    return {
      message: 'Lấy dữ liệu hiệu suất tuyển dụng & chỉ số SLA thành công',
      data,
    };
  }

  /**
   * ?limit=5  — số bản ghi mỗi loại (mặc định 5, tối đa 20)
   */
  @Get('recent-activities')
  async getRecentActivities(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('departmentId') departmentId?: string,
  ) {
    const cleanDeptId =
      departmentId && departmentId.trim() && departmentId !== 'ALL'
        ? departmentId.trim()
        : undefined;
    const data = await this.analyticsService.getRecentActivities(limit, cleanDeptId);
    return {
      message: 'Lấy hoạt động gần đây thành công',
      data,
    };
  }

  @Get('alerts')
  async getActionableAlerts(
    @Query('departmentId') departmentId?: string,
    @Query('jobDescriptionId') jobDescriptionId?: string,
  ) {
    const cleanDeptId =
      departmentId && departmentId.trim() && departmentId !== 'ALL'
        ? departmentId.trim()
        : undefined;
    const cleanJobId =
      jobDescriptionId && jobDescriptionId.trim() && jobDescriptionId !== 'ALL'
        ? jobDescriptionId.trim()
        : undefined;
    const data = await this.analyticsService.getActionableAlerts(cleanDeptId, cleanJobId);
    return {
      message: 'Lấy danh sách cảnh báo công việc thành công',
      data,
    };
  }

  @Get('compensation')
  async getCompensationStats(@Query('departmentId') departmentId?: string) {
    const cleanDeptId =
      departmentId && departmentId.trim() && departmentId !== 'ALL'
        ? departmentId.trim()
        : undefined;
    const data = await this.analyticsService.getCompensationAndRequisitionStats(cleanDeptId);
    return {
      message: 'Lấy dữ liệu ngân sách và vị trí tuyển dụng thành công',
      data,
    };
  }

  @Get('export-report')
  async getExportReportData(
    @Query('departmentId') departmentId?: string,
    @Query('jobDescriptionId') jobDescriptionId?: string,
  ) {
    const cleanDeptId =
      departmentId && departmentId.trim() && departmentId !== 'ALL'
        ? departmentId.trim()
        : undefined;
    const cleanJobId =
      jobDescriptionId && jobDescriptionId.trim() && jobDescriptionId !== 'ALL'
        ? jobDescriptionId.trim()
        : undefined;
    const data = await this.analyticsService.getExportReportData(cleanDeptId, cleanJobId);
    return {
      message: 'Lấy dữ liệu xuất báo cáo tuyển dụng thành công',
      data,
    };
  }

  /**
   * ?months=6  — số tháng cho timeline trends
   * ?limit=5   — số bản ghi cho recent activities
   */
  @Get('all')
  async getAllDashboardData(
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('departmentId') departmentId?: string,
    @Query('jobDescriptionId') jobDescriptionId?: string,
  ) {
    const safeMonths = Math.min(Math.max(1, months), 24);
    const cleanDeptId =
      departmentId && departmentId.trim() && departmentId !== 'ALL'
        ? departmentId.trim()
        : undefined;
    const cleanJobId =
      jobDescriptionId && jobDescriptionId.trim() && jobDescriptionId !== 'ALL'
        ? jobDescriptionId.trim()
        : undefined;

    const [
      kpis,
      funnel,
      departmentFulfillment,
      offers,
      trends,
      activities,
      velocity,
      alerts,
      compensation,
    ] = await Promise.all([
      this.analyticsService.getOverviewKpis(cleanDeptId, cleanJobId),
      this.analyticsService.getRecruitmentFunnel(cleanDeptId, cleanJobId),
      this.analyticsService.getDepartmentFulfillment(cleanDeptId),
      this.analyticsService.getOfferBreakdown(cleanDeptId, cleanJobId),
      this.analyticsService.getApplicationTrends(safeMonths, cleanDeptId, cleanJobId),
      this.analyticsService.getRecentActivities(limit, cleanDeptId),
      this.analyticsService.getHiringVelocityMetrics(cleanDeptId, cleanJobId),
      this.analyticsService.getActionableAlerts(cleanDeptId, cleanJobId),
      this.analyticsService.getCompensationAndRequisitionStats(cleanDeptId),
    ]);

    return {
      message: 'Lấy toàn bộ dữ liệu Dashboard HR thành công',
      data: {
        kpis,
        funnel,
        departmentFulfillment,
        offers,
        trends,
        activities,
        velocity,
        alerts,
        compensation,
      },
    };
  }
}
