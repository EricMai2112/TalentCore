import { Controller, Get, Post, Put, Patch, Body, Param, Query, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InterviewService } from '../services/interview.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  SubmitDeptScheduleDto,
  CandidateRescheduleDto,
  ProposeAdminSlotsDto,
  CandidateCancelDto,
  UpdateInterviewStatusDto,
} from '../dtos/interview.dto';
import { InterviewStatus, InterviewResult, InterviewConfirmationStatus } from '../schemas/interview.schema';

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

  @Get('available-slots')
  async getAvailableSlots(
    @Query('interviewerId') interviewerId?: string,
    @Query('durationMinutes') durationMinutes?: string,
    @Query('daysAhead') daysAhead?: string,
    @Query('date') date?: string,
  ) {
    const duration = durationMinutes ? parseInt(durationMinutes, 10) : 60;
    const days = daysAhead ? parseInt(daysAhead, 10) : 14;
    return await this.interviewService.getAvailableTimeSlots(interviewerId, duration, days, date);
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

  @Patch(':id/submit-dept-schedule')
  async submitDeptSchedule(@Param('id') id: string, @Body() dto: SubmitDeptScheduleDto) {
    return await this.interviewService.submitDeptSchedule(id, dto);
  }

  @Patch(':id/hr-approve-schedule')
  async approveInterviewSchedule(@Param('id') id: string) {
    return await this.interviewService.approveInterviewSchedule(id);
  }

  @Post(':id/reschedule-request')
  async requestCandidateReschedule(
    @Param('id') id: string,
    @Body() dto: CandidateRescheduleDto,
  ) {
    return await this.interviewService.requestCandidateReschedule(id, dto);
  }

  @Patch(':id/approve-reschedule')
  async approveCandidateReschedule(@Param('id') id: string) {
    return await this.interviewService.approveCandidateReschedule(id);
  }

  @Patch(':id/reject-reschedule')
  async rejectCandidateReschedule(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return await this.interviewService.rejectCandidateReschedule(id, reason);
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
    @Body('confirmationStatus') confirmationStatus: InterviewConfirmationStatus,
  ) {
    return await this.interviewService.updateCandidateConfirmation(id, confirmationStatus);
  }

  @Patch(':id/propose-admin-slots')
  async proposeAdminSlots(
    @Param('id') id: string,
    @Body() dto: ProposeAdminSlotsDto,
  ) {
    return await this.interviewService.proposeAdminSlots(id, dto.proposedSlots, dto.notes);
  }

  @Patch(':id/accept-proposed-slot')
  async acceptProposedSlot(
    @Param('id') id: string,
    @Body('selectedSlot') selectedSlot: { date: string; startTime: string; endTime: string },
  ) {
    return await this.interviewService.acceptProposedSlot(id, selectedSlot);
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
