import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../services/notifications.service';
import { QueryNotificationDto } from '../dtos/query-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: Request): string {
    let token = req.cookies?.['accessToken'];

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Chưa đăng nhập');
    }

    try {
      const payload = this.jwtService.verify(token);
      return payload.sub || payload.id || payload._id;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserNotifications(
    @Req() req: Request,
    @Query() query: QueryNotificationDto,
  ) {
    const userId = this.extractUserId(req);
    const data = await this.notificationsService.getUserNotifications(userId, query);
    return {
      message: 'Lấy danh sách thông báo thành công',
      data,
    };
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const userId = this.extractUserId(req);
    const count = await this.notificationsService.getUnreadCount(userId);
    return {
      message: 'Lấy số lượng thông báo chưa đọc thành công',
      data: { count },
    };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const userId = this.extractUserId(req);
    const result = await this.notificationsService.markAllAsRead(userId);
    return {
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      data: result,
    };
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: Request, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    const data = await this.notificationsService.markAsRead(id, userId);
    return {
      message: 'Đã đánh dấu thông báo là đã đọc',
      data,
    };
  }

  @Delete(':id')
  async deleteNotification(@Req() req: Request, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    const result = await this.notificationsService.deleteNotification(id, userId);
    return result;
  }
}
