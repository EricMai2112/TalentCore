import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { AuthService } from '../services/auth.service';

@Controller('users')
export class UserOAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('oauth/google')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    await this.authService.handleOAuthCallback(code, state, res);
  }
}
