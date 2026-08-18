import { BadRequestException, Body, Controller, Get, Patch, Post, Req, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { CandidateService } from '../services/candidates.service';
import { UpdateCandidateProfileDto } from '../dtos/candidate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvParserService } from '../services/cv-parser.service';
import { memoryStorage } from 'multer';

@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly jwtService: JwtService,
    private readonly cvParserService: CvParserService,
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

  @Post('parse-cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = /\.(pdf|docx|png|jpg|jpeg|webp)$/i;
        if (!file.originalname.match(allowed)) {
          return cb(
            new BadRequestException('Chỉ chấp nhận file PDF, Word (.docx) hoặc Ảnh (PNG, JPG).'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async parseCv(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const token = req.cookies?.['accessToken'];
    if (!token) {
      throw new UnauthorizedException('Chưa đăng nhập');
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng tải lên file hợp lệ.');
    }

    const parsedData = await this.cvParserService.parseCvFileWithAi(file);

    return {
      message: 'Bóc tách CV thành công',
      data: parsedData,
    };
  }
}