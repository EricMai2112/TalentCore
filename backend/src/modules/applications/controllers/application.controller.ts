import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from '../services/application.service';
import { ApplyJobDto } from '../dtos/application.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('apply')
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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async applyJob(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyJobDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.applicationService.applyJob(userId, dto.jobDescriptionId, dto.candidateId, file);
  }

  @Get('my-applications')
  async getMyApplications(@CurrentUser('id') userId: string) {
    const data = await this.applicationService.getApplicationsByUserId(userId);
    return {
      message: 'Lấy danh sách đơn ứng tuyển của tôi thành công',
      data,
    };
  }

  @Get('kanban')
  @Roles(UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER)
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
  @Roles(UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER)
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
  @Roles(UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE)
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

  @Post(':id/reject')
  @Roles(UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async rejectApplication(
    @Param('id') id: string,
    @Body() dto: { reason: string; authorName?: string; authorRole?: string },
  ) {
    const data = await this.applicationService.rejectApplication(
      id,
      dto.reason,
      dto.authorName,
      dto.authorRole,
    );
    return {
      message: 'Từ chối đơn ứng tuyển thành công',
      data,
    };
  }

  @Delete(':id')
  @Roles(UserRole.HR_ADMIN)
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
  @Roles(UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async reEvaluateApplication(@Param('id') id: string) {
    const data = await this.applicationService.reEvaluateApplication(id);
    return {
      message: 'Đã kích hoạt chấm điểm lại cho đơn ứng tuyển',
      data,
    };
  }
}