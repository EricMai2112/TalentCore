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
import { EmailTemplateService } from '../services/email-template.service';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
} from '../dtos/email-template.dto';

@Controller('email-templates')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  async create(@Body() createEmailTemplateDto: CreateEmailTemplateDto) {
    const template =
      await this.emailTemplateService.create(createEmailTemplateDto);
    return {
      message: 'Tạo email template thành công',
      data: template,
    };
  }

  @Get()
  async findAll() {
    const templates = await this.emailTemplateService.findAll();
    return {
      message: 'Lấy danh sách email template thành công',
      data: templates,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const template = await this.emailTemplateService.findById(id);
    return {
      message: 'Lấy email template thành công',
      data: template,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto,
  ) {
    const template = await this.emailTemplateService.update(
      id,
      updateEmailTemplateDto,
    );
    return {
      message: 'Cập nhật email template thành công',
      data: template,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.emailTemplateService.delete(id);
    return {
      message: 'Xóa email template thành công',
    };
  }
}
