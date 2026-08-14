import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private jwtService: JwtService) {}

    @Post("register")
    @UsePipes(new ValidationPipe())
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto)
    }

    @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    res.cookie('accessToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });

    res.cookie('user_info', JSON.stringify(result.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return result;
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const token = req.cookies?.['accessToken'];
    if (!token) {
      throw new UnauthorizedException('Chưa đăng nhập');
    }

    try {
      const payload = this.jwtService.verify(token);
      return this.authService.getMe(payload.email);
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('user_info');
    return { message: 'Đăng xuất thành công' };
  }
}
