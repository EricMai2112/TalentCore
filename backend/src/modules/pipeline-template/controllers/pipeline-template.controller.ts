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
import { PipelineTemplateService } from '../services/pipeline-template.service';
import {
  CreatePipelineTemplateDto,
  UpdatePipelineTemplateDto,
} from '../dtos/pipeline-template.dto';

@Controller('pipeline-templates')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class PipelineTemplateController {
  constructor(
    private readonly pipelineTemplateService: PipelineTemplateService,
  ) {}

  @Post()
  async create(@Body() createPipelineTemplateDto: CreatePipelineTemplateDto) {
    const template = await this.pipelineTemplateService.create(
      createPipelineTemplateDto,
    );
    return {
      message: 'Tạo pipeline template thành công',
      data: template,
    };
  }

  @Get()
  async findAll() {
    const templates = await this.pipelineTemplateService.findAll();
    return {
      message: 'Lấy danh sách pipeline template thành công',
      data: templates,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const template = await this.pipelineTemplateService.findById(id);
    return {
      message: 'Lấy pipeline template thành công',
      data: template,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePipelineTemplateDto: UpdatePipelineTemplateDto,
  ) {
    const template = await this.pipelineTemplateService.update(
      id,
      updatePipelineTemplateDto,
    );
    return {
      message: 'Cập nhật pipeline template thành công',
      data: template,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.pipelineTemplateService.delete(id);
    return {
      message: 'Xóa pipeline template thành công',
    };
  }
}
