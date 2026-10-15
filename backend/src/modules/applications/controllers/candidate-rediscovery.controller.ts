import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CandidateRediscoveryService } from '../services/candidate-rediscovery.service';
import { InviteCandidateDto, RespondInvitationDto } from '../dtos/candidate-invitation.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';

@Controller('applications/rediscovery')
export class CandidateRediscoveryController {
  constructor(private readonly rediscoveryService: CandidateRediscoveryService) {}

  /**
   * HR xem danh sách ứng viên tiềm năng (Silver Medalists) được gợi ý cho 1 JD.
   */
  @Get('recommendations/:jobDescriptionId')
  @Roles(UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async getRecommendations(@Param('jobDescriptionId') jobDescriptionId: string) {
    const data = await this.rediscoveryService.getRecommendedCandidates(jobDescriptionId);
    return {
      message: 'Lấy danh sách ứng viên tiềm năng thành công',
      data,
    };
  }

  /**
   * HR gửi lời mời tái ứng tuyển tới ứng viên.
   */
  @Post('invite')
  @Roles(UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async inviteCandidate(
    @CurrentUser('id') hrUserId: string,
    @Body() dto: InviteCandidateDto,
  ) {
    const data = await this.rediscoveryService.inviteCandidate(dto, hrUserId);
    return {
      message: 'Đã gửi thư mời tái ứng tuyển thành công',
      data,
    };
  }

  /**
   * Ứng viên xem danh sách các lời mời của mình.
   */
  @Get('my-invitations')
  async getMyInvitations(@CurrentUser('id') userId: string) {
    const data = await this.rediscoveryService.getMyInvitations(userId);
    return {
      message: 'Lấy danh sách lời mời ứng tuyển thành công',
      data,
    };
  }

  /**
   * Ứng viên phản hồi lời mời: Chấp nhận (1-Click Apply) hoặc Từ chối.
   */
  @Post('respond/:invitationId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async respondInvitation(
    @Param('invitationId') invitationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RespondInvitationDto,
  ) {
    return this.rediscoveryService.respondInvitation(invitationId, userId, dto);
  }
}
