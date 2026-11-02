import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CandidateService } from '../services/candidates.service';
import {
  CreateCandidateProfileDto,
  UpdateCandidateProfileDto,
} from '../dtos/candidate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvParserService } from '../services/cv-parser.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly cvParserService: CvParserService,
  ) {}

  @Get('profiles')
  async listProfiles(@CurrentUser('id') userId: string) {
    return this.candidateService.listProfiles(userId);
  }

  @Post('profiles')
  async createProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCandidateProfileDto,
  ) {
    return this.candidateService.createProfile(userId, dto);
  }

  @Get('profiles/:id')
  async getProfileById(
    @CurrentUser('id') userId: string,
    @Param('id') profileId: string,
  ) {
    return this.candidateService.getProfileById(userId, profileId);
  }

  @Patch('profiles/:id')
  async updateProfileById(
    @CurrentUser('id') userId: string,
    @Param('id') profileId: string,
    @Body() dto: UpdateCandidateProfileDto,
  ) {
    return this.candidateService.updateProfile(userId, profileId, dto);
  }

  @Post('profiles/:id/set-default')
  async setDefault(
    @CurrentUser('id') userId: string,
    @Param('id') profileId: string,
  ) {
    return this.candidateService.setDefault(userId, profileId);
  }

  @Delete('profiles/:id')
  async deleteProfile(
    @CurrentUser('id') userId: string,
    @Param('id') profileId: string,
  ) {
    return this.candidateService.deleteProfile(userId, profileId);
  }

  @Get('profile')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.candidateService.getProfileByUserId(userId);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCandidateProfileDto,
  ) {
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
  async parseCv(
    @CurrentUser('id') _userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Vui lòng tải lên file hợp lệ.');
    }
    const parsedData = await this.cvParserService.parseCvFileWithAi(file);
    return { message: 'Bóc tách CV thành công', data: parsedData };
  }
}
