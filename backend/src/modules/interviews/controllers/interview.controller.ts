import { Controller, Get, Post, Put, Patch, Body, Param, Query, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InterviewService } from '../services/interview.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  SubmitDeptScheduleDto,
  CandidateCancelDto,
  UpdateInterviewStatusDto,
} from '../dtos/interview.dto';
import { InterviewConfirmationStatus } from '../schemas/interview.schema';

@Controller('interviews')
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('my-interviews')
  async getMyInterviews(@Req() req: any) {
    let token = req.cookies?.['accessToken'];

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Chưa đăng nhập');
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id || payload._id;

      const data = await this.interviewService.getMyInterviews(userId);
      return {
        message: 'Lấy danh sách lịch phỏng vấn của tôi thành công',
        data,
      };
    } catch (error: any) {
      if (error?.status && error.status !== 500) {
        throw error;
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  @Get('candidates-select')
  async getCandidatesForSelect() {
    return await this.interviewService.getCandidatesForSelect();
  }

  @Get('check-conflict')
  async checkConflict(
    @Query('interviewerId') interviewerId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('excludeInterviewId') excludeInterviewId?: string,
  ) {
    const conflict = await this.interviewService.checkInterviewerConflict(
      interviewerId,
      date,
      startTime,
      endTime,
      excludeInterviewId,
    );
    return {
      hasConflict: !!conflict,
      conflict,
    };
  }

  @Get()
  async getInterviews(@Query('status') status?: string) {
    return await this.interviewService.getInterviews(status);
  }

  @Get('application/:applicationId')
  async getInterviewByApplicationId(@Param('applicationId') applicationId: string) {
    return await this.interviewService.getInterviewByApplicationId(applicationId);
  }

  @Get(':id')
  async getInterviewById(@Param('id') id: string) {
    return await this.interviewService.getInterviewById(id);
  }

  @Post()
  async createInterview(@Body() dto: CreateInterviewDto) {
    return await this.interviewService.createInterview(dto);
  }

  @Post('request-dept-schedule')
  async requestDeptSchedule(@Body('applicationId') applicationId: string) {
    return await this.interviewService.requestDeptSchedule(applicationId);
  }

  @Patch(':id/dept-reject')
  async rejectDeptCv(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return await this.interviewService.rejectDeptCv(id, reason);
  }

  @Patch(':id/submit-dept-schedule')
  async submitDeptSchedule(@Param('id') id: string, @Body() dto: SubmitDeptScheduleDto) {
    return await this.interviewService.submitDeptSchedule(id, dto);
  }

  @Patch(':id/hr-approve-schedule')
  async approveInterviewSchedule(@Param('id') id: string) {
    return await this.interviewService.approveInterviewSchedule(id);
  }

  @Put(':id')
  async updateInterview(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return await this.interviewService.updateInterview(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewStatusDto,
  ) {
    return await this.interviewService.updateStatus(id, dto.status, dto.result, dto.feedback);
  }

  @Patch(':id/candidate-confirm')
  async updateCandidateConfirmation(
    @Param('id') id: string,
    @Body('confirmationStatus') confirmationStatus: InterviewConfirmationStatus = InterviewConfirmationStatus.CONFIRMED,
  ) {
    return await this.interviewService.updateCandidateConfirmation(id, confirmationStatus);
  }

  @Patch(':id/request-cancel')
  async requestCandidateCancellation(
    @Param('id') id: string,
    @Body() dto: CandidateCancelDto,
  ) {
    return await this.interviewService.requestCandidateCancellation(id, dto.reason);
  }

  @Patch(':id/approve-cancel')
  async approveCandidateCancellation(@Param('id') id: string) {
    return await this.interviewService.approveCandidateCancellation(id);
  }
}
