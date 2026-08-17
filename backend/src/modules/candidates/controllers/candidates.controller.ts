import { Body, Controller, Get, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { CandidateService } from '../services/candidates.service';
import { UpdateCandidateProfileDto } from '../dtos/candidate.dto';

@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('profile')
  async getMyProfile(@Req() req: Request) {
    const token = req.cookies?.['accessToken'];
    if (!token) {
      throw new UnauthorizedException('Chưa đăng nhập');
    }

    try {
      const payload = this.jwtService.verify(token);
      return this.candidateService.getProfileByUserId(payload.sub);
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  @Patch('profile')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateCandidateProfileDto) {
    const token = req.cookies?.['accessToken'];
    if (!token) {
      throw new UnauthorizedException('Chưa đăng nhập');
    }
    try {
      const payload = this.jwtService.verify(token);
      return this.candidateService.updateProfile(payload.sub, dto);
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}