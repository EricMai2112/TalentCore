import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { CandidateService } from '../services/candidates.service';
import {
  CreateCandidateProfileDto,
  UpdateCandidateProfileDto,
} from '../dtos/candidate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvParserService } from '../services/cv-parser.service';

@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly jwtService: JwtService,
    private readonly cvParserService: CvParserService,
  ) {}

  
  private getUserIdFromRequest(req: Request): string {
    const token = req.cookies?.['accessToken'];
    if (!token) throw new UnauthorizedException('Chưa đăng nhập');
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  @Get('profiles')
  async listProfiles(@Req() req: Request) {
    const userId = this.getUserIdFromRequest(req);
    return this.candidateService.listProfiles(userId);
  }

  @Post('profiles')
  async createProfile(@Req() req: Request, @Body() dto: CreateCandidateProfileDto) {
    const userId = this.getUserIdFromRequest(req);
    return this.candidateService.createProfile(userId, dto);
  }

  @Get('profiles/:id')
  async getProfileById(@Req() req: Request, @Param('id') profileId: string) {
    const userId = this.getUserIdFromRequest(req);
    return this.candidateService.getProfileById(userId, profileId);
  }

  @Patch('profiles/:id')
  async updateProfileById(
    @Req() req: Request,
    @Param('id') profileId: string,
    @Body() dto: UpdateCandidateProfileDto,
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.candidateService.updateProfile(userId, profileId, dto);
  }

  @Post('profiles/:id/set-default')
  async setDefault(@Req() req: Request, @Param('id') profileId: string) {
    const userId = this.getUserIdFromRequest(req);
    return this.candidateService.setDefault(userId, profileId);
  }

  @Delete('profiles/:id')
  async deleteProfile(@Req() req: Request, @Param('id') profileId: string) {
    const userId = this.getUserIdFromRequest(req);
    return this.candidateService.deleteProfile(userId, profileId);
  }

  @Get('profile')
  async getMyProfile(@Req() req: Request) {
    const userId = this.getUserIdFromRequest(req);
    return this.candidateService.getProfileByUserId(userId);
  }

  @Patch('profile')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateCandidateProfileDto) {
    const userId = this.getUserIdFromRequest(req);
    const defaultProfile = await this.candidateService.getDefaultProfile(userId);
    return this.candidateService.updateProfile(
      userId,
      (defaultProfile._id as any).toString(),
      dto,
    );
  }


  @Post('parse-cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(pdf|docx|png|jpg|jpeg|webp)$/i;
        if (!file.originalname.match(allowed)) {
          return cb(
            new BadRequestException(
              'Chỉ chấp nhận file PDF, Word (.docx) hoặc Ảnh (PNG, JPG).',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async parseCv(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    this.getUserIdFromRequest(req); // auth check only
    if (!file?.buffer) {
      throw new BadRequestException('Vui lòng tải lên file hợp lệ.');
    }
    const parsedData = await this.cvParserService.parseCvFileWithAi(file);
    return { message: 'Bóc tách CV thành công', data: parsedData };
  }
}
