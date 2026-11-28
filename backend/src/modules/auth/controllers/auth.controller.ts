import { BadRequestException, Body, Controller, Get, Patch, Post, Query, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  ResetPasswordWithOtpDto,
  SendOtpDto,
  VerifyForgotPasswordDto,
  VerifyOtpDto,
} from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';
import type { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('google/url')
  getGoogleAuthUrl(@Query('state') state?: string) {
    return {
      url: this.authService.getGoogleAuthUrl(state || 'candidates'),
    };
  }

  @Public()
  @Get('google')
  googleAuthRedirect(@Query('state') state: string, @Res() res: Response) {
    const url = this.authService.getGoogleAuthUrl(state || 'candidates');
    return res.redirect(url);
  }

  @Public()
  @Get('oauth/google')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    await this.authService.handleOAuthCallback(code, state, res);
  }

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

  @Patch('change-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('user_info');
    return { message: 'Đăng xuất thành công' };
  }

  @Public()
  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('verify-forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyForgotPassword(@Body() dto: VerifyForgotPasswordDto) {
    return this.authService.verifyForgotPasswordToken(dto.token);
  }

  @Public()
  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('forgot-password-otp')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPasswordOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendForgotPasswordOtp(dto.email);
  }

  @Public()
  @Post('verify-otp')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyForgotPasswordOtp(dto.email, dto.otp);
  }

  @Public()
  @Post('reset-password-otp')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPasswordWithOtp(@Body() dto: ResetPasswordWithOtpDto) {
    return this.authService.resetPasswordWithOtp(dto);
  }
}
