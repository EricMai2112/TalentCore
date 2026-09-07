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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JobDescriptionService } from '../services/job-description.service';
import { CreateJobDescriptionDto, UpdateJobDescriptionDto } from '../dtos/job-description.dto';
import { SuggestCriteriaWeightsDto } from '../dtos/suggest-criteria-weights.dto';
import { GenerateJdContentDto } from '../dtos/generate-jd-content.dto';

@Controller('job-descriptions')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class JobDescriptionController {
  constructor(private readonly jobDescriptionService: JobDescriptionService) {}

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

  @Get('public')
  async findPublicJobs() {
    const jobs = await this.jobDescriptionService.findPublicJobs();
    return {
      message: 'Lấy danh sách Job tuyển dụng công khai thành công',
      data: jobs,
    };
  }

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
