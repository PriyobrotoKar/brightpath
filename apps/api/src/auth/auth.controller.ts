import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/send-otp')
  sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }
}
