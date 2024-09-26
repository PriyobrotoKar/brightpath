import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/send-otp')
  sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('/verify-otp')
  @HttpCode(200)
  verifyOtp(@Body() { email, otp }: { email: string; otp: string }) {
    return this.authService.verifyOtp(email, otp);
  }
}
