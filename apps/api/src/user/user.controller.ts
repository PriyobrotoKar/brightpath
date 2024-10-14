import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '@/decorators/user.decorator';
import type { JWTPayload } from '../auth/types/jwt-payload';
import { UpdateUserDto } from './dto/update.user';
import type { Response } from 'express';
import { setResponseCookie } from '@/common/utils';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getSelf(@CurrentUser() user: JWTPayload) {
    return this.userService.getSelf(user);
  }

  @Patch()
  updateSelf(@CurrentUser() user: JWTPayload, @Body() dto: UpdateUserDto) {
    return this.userService.updateSelf(user, dto);
  }

  @Post('validate-email-change')
  @HttpCode(200)
  async validateEmailChange(
    @CurrentUser() user: JWTPayload,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, ...updatedUser } =
      await this.userService.verifyEmailChange(otp, user);

    setResponseCookie(res, 'access_token', access_token);
    setResponseCookie(res, 'refresh_token', refresh_token);

    return updatedUser;
  }
}
