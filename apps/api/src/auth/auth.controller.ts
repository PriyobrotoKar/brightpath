import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '@/decorators/public.decorator';
import type { Response } from 'express';
import { setResponseCookie } from '@/common/utils';

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
    const { access_token, ...user } = await this.authService.verifyOtp(
      email,
      otp,
    );
    setResponseCookie(res, access_token);
    return user;
  }
}
