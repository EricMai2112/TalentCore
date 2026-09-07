import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ApplicationService } from '../services/application.service';
import { ApplyJobDto } from '../dtos/application.dto';

@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('apply')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async applyJob(@Req() req: Request, @Body() dto: ApplyJobDto) {
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

      return await this.applicationService.applyJob(userId, dto.jobDescriptionId, dto.candidateId);
    } catch (error: any) {
      if (error?.status && error.status !== 500) {
        throw error;
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  @Get('my-applications')
  async getMyApplications(@Req() req: Request) {
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

      const data = await this.applicationService.getApplicationsByUserId(userId);
      return {
        message: 'Lấy danh sách đơn ứng tuyển của tôi thành công',
        data,
      };
    } catch (error: any) {
      if (error?.status && error.status !== 500) {
        throw error;
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  @Get('kanban')
  async getKanbanApplications(
    @Query('departmentId') departmentId?: string,
    @Query('jobId') jobId?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.applicationService.getKanbanApplications({
      departmentId,
      jobId,
      search,
    });
    return {
      message: 'Lấy danh sách ứng tuyển cho Kanban thành công',
      data,
    };
  }

  @Put(':id/stage')
  async updateApplicationStage(
    @Param('id') id: string,
    @Body('stageId') stageId: string,
  ) {
    const data = await this.applicationService.updateApplicationStage(id, stageId);
    return {
      message: 'Cập nhật giai đoạn phỏng vấn thành công',
      data,
    };
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() dto: { authorName: string; authorRole: string; content: string },
  ) {
    const data = await this.applicationService.addNote(id, dto);
    return {
      message: 'Thêm ghi chú thành công',
      data,
    };
  }

  @Delete(':id')
  async deleteApplication(@Param('id') id: string) {
    const data = await this.applicationService.deleteApplication(id);
    return {
      message: 'Xóa đơn ứng tuyển thành công',
      data,
    };
  }

  @Get(':id')
  async getApplicationById(@Param('id') id: string) {
    const data = await this.applicationService.getApplicationById(id);
    return {
      message: 'Lấy chi tiết đơn ứng tuyển thành công',
      data,
    };
  }

  @Post(':id/re-evaluate')
  async reEvaluateApplication(@Param('id') id: string) {
    const data = await this.applicationService.reEvaluateApplication(id);
    return {
      message: 'Đã kích hoạt chấm điểm lại cho đơn ứng tuyển',
      data,
    };
  }
}