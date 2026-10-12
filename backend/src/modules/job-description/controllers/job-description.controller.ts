import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JobDescriptionService } from '../services/job-description.service';
import { CreateJobDescriptionDto, UpdateJobDescriptionDto } from '../dtos/job-description.dto';
import { SuggestCriteriaWeightsDto } from '../dtos/suggest-criteria-weights.dto';
import { GenerateJdContentDto } from '../dtos/generate-jd-content.dto';
import { SaveJobDraftDto } from '../dtos/save-job-draft.dto';

import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('job-descriptions')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class JobDescriptionController {
  constructor(private readonly jobDescriptionService: JobDescriptionService) {}

  @Post('drafts')
  async saveDraft(
    @Body() dto: SaveJobDraftDto,
    @CurrentUser('id') userId: string,
  ) {
    const draft = await this.jobDescriptionService.saveDraft(
      dto,
      userId || '65f000000000000000000001',
    );
    return {
      message: 'Lưu bản nháp thành công',
      data: draft,
    };
  }

  @Get('drafts/:positionId')
  async getDraftByPosition(
    @Param('positionId') positionId: string,
    @Query('experienceLevel') experienceLevel?: string,
  ) {
    const draft = await this.jobDescriptionService.getDraftByPosition(
      positionId,
      experienceLevel,
    );
    return {
      message: 'Lấy bản nháp thành công',
      data: draft,
    };
  }

  @Delete('drafts/:positionId')
  @HttpCode(HttpStatus.OK)
  async deleteDraft(
    @Param('positionId') positionId: string,
    @Query('experienceLevel') experienceLevel?: string,
  ) {
    await this.jobDescriptionService.deleteDraft(positionId, experienceLevel);
    return {
      message: 'Xóa bản nháp thành công',
    };
  }

  @Post('ai-suggest-weights')
  async suggestCriteriaWeightsWithAi(@Body() dto: SuggestCriteriaWeightsDto) {
    const result = await this.jobDescriptionService.suggestCriteriaWeightsWithAi(dto);
    return {
      message: 'Gợi ý trọng số tiêu chí bằng AI thành công',
      data: result,
    };
  }

  @Post('ai-generate-content')
  async generateJdContentWithAi(@Body() dto: GenerateJdContentDto) {
    const result = await this.jobDescriptionService.generateJdContentWithAi(dto);
    return {
      message: 'Soạn thảo nội dung JD bằng AI thành công',
      data: result,
    };
  }

  @Post()
  async create(@Body() createDto: CreateJobDescriptionDto) {
    const job = await this.jobDescriptionService.create(createDto);
    return {
      message: 'Tạo Job Description thành công',
      data: job,
    };
  }

  @Get()
  async findAll() {
    const jobs = await this.jobDescriptionService.findAll();
    return {
      message: 'Lấy danh sách Job Description thành công',
      data: jobs,
    };
  }

  @Public()
  @Get('public')
  async findPublicJobs() {
    const jobs = await this.jobDescriptionService.findPublicJobs();
    return {
      message: 'Lấy danh sách Job tuyển dụng công khai thành công',
      data: jobs,
    };
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    const job = await this.jobDescriptionService.findById(id);
    return {
      message: 'Lấy Job Description thành công',
      data: job,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateJobDescriptionDto,
  ) {
    const job = await this.jobDescriptionService.update(id, updateDto);
    return {
      message: 'Cập nhật Job Description thành công',
      data: job,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.jobDescriptionService.delete(id);
    return {
      message: 'Xóa Job Description thành công',
    };
  }
}
