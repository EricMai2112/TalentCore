import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { OffersService } from '../services/offers.service';
import { CreateOfferDto } from '../dtos/create-offer.dto';
import { UpdateOfferDto } from '../dtos/update-offer.dto';
import { RespondOfferDto } from '../dtos/respond-offer.dto';
import { QueryOfferDto } from '../dtos/query-offer.dto';

@Controller('offers')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserFromReq(req: Request) {
    let token = (req as any).cookies?.['accessToken'];

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
      return {
        id: payload.sub || payload.id || payload._id,
        role: payload.role,
        departmentId: payload.departmentId,
        email: payload.email,
        name: payload.name,
      };
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  @Get('my-offers')
  async getMyOffers(@Req() req: Request) {
    const user = this.extractUserFromReq(req);
    const data = await this.offersService.getMyOffers(user.id);
    return {
      message: 'Lấy danh sách lời mời nhận việc của bạn thành công',
      data,
    };
  }

  @Post(':id/respond')
  async candidateRespond(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: RespondOfferDto,
  ) {
    const user = this.extractUserFromReq(req);
    const data = await this.offersService.candidateRespond(id, user.id, dto);
    return {
      message:
        dto.action === 'ACCEPT'
          ? 'Đồng ý nhận việc thành công'
          : 'Đã gửi phản hồi từ chối nhận việc',
      data,
    };
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateOfferDto) {
    const user = this.extractUserFromReq(req);
    const data = await this.offersService.create(dto, user.id);
    return {
      message: dto.sendImmediately ? 'Gửi đề nghị nhận việc thành công' : 'Tạo bản nháp đề nghị nhận việc thành công',
      data,
    };
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: QueryOfferDto) {
    const user = this.extractUserFromReq(req);
    const result = await this.offersService.findAll(query, user);
    return {
      message: 'Lấy danh sách đề nghị nhận việc thành công',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.offersService.findOne(id);
    return {
      message: 'Lấy thông tin đề nghị nhận việc thành công',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    const user = this.extractUserFromReq(req);
    const data = await this.offersService.update(id, dto, user.id);
    return {
      message: 'Cập nhật đề nghị nhận việc thành công',
      data,
    };
  }

  @Post(':id/send')
  async sendOffer(@Req() req: Request, @Param('id') id: string) {
    const user = this.extractUserFromReq(req);
    const data = await this.offersService.sendOffer(id, user.id);
    return {
      message: 'Gửi đề nghị nhận việc đến ứng viên thành công',
      data,
    };
  }

  @Post(':id/withdraw')
  async withdrawOffer(@Req() req: Request, @Param('id') id: string) {
    const user = this.extractUserFromReq(req);
    const data = await this.offersService.withdrawOffer(id, user.id);
    return {
      message: 'Thu hồi đề nghị nhận việc thành công',
      data,
    };
  }
}
