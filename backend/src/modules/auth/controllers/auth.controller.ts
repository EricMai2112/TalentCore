import { Body, Controller, Get, Post, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';
import type { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
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

    return result;
  }

  @Get('me')
  async getMe(@CurrentUser('email') email: string) {
    return this.authService.getMe(email);
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('user_info');
    return { message: 'Đăng xuất thành công' };
  }
}
