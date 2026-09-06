import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { InterviewService } from '../services/interview.service';
import { CreateInterviewDto, UpdateInterviewDto } from '../dtos/interview.dto';
import { InterviewStatus, InterviewResult } from '../schemas/interview.schema';

@Controller('interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

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
}
