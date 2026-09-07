import { Controller, Get, Post, Put, Patch, Body, Param, Query, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InterviewService } from '../services/interview.service';
import { CreateInterviewDto, UpdateInterviewDto } from '../dtos/interview.dto';
import { InterviewStatus, InterviewResult } from '../schemas/interview.schema';

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

  @Get()
  async getInterviews(@Query('status') status?: string) {
    return await this.interviewService.getInterviews(status);
  }

  @Post()
  async createInterview(@Body() dto: CreateInterviewDto) {
    return await this.interviewService.createInterview(dto);
  }

  @Put(':id')
  async updateInterview(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return await this.interviewService.updateInterview(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status?: InterviewStatus,
    @Body('result') result?: InterviewResult,
    @Body('feedback') feedback?: string,
  ) {
    return await this.interviewService.updateStatus(id, status, result, feedback);
  }

  @Patch(':id/candidate-confirm')
  async updateCandidateConfirmation(
    @Param('id') id: string,
    @Body('confirmationStatus') confirmationStatus: string,
  ) {
    return await this.interviewService.updateCandidateConfirmation(id, confirmationStatus);
  }
}
