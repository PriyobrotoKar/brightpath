import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '@/decorators/public.decorator';
import type { Response } from 'express';
import { setResponseCookie } from '@/common/utils';
import { CurrentUser } from '@/decorators/user.decorator';
import type { JWTPayload } from './types/jwt-payload';
import { RefreshJwtAuthGuard } from './guard/refresh-auth.guard';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/send-otp')
  sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('/verify-otp')
  @HttpCode(200)
  async verifyOtp(
    @Body() { email, otp }: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, ...user } =
      await this.authService.verifyOtp(email, otp);
    setResponseCookie(res, 'access_token', access_token);
    setResponseCookie(res, 'refresh_token', refresh_token);
    return { access_token, refresh_token, user };
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('/refresh-token')
  @HttpCode(200)
  async refreshToken(
    @CurrentUser() user: JWTPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.refreshToken(user);
    setResponseCookie(res, 'access_token', access_token);
    setResponseCookie(res, 'refresh_token', refresh_token);
    return { access_token, refresh_token, user };
  }
}
