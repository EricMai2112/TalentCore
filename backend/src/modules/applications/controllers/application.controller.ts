import {
  Controller,
  Post,
  Body,
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
}