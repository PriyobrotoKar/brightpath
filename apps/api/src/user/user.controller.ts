import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '@/decorators/user.decorator';
import type { JWTPayload } from './user.types';
import { UpdateUserDto } from './dto/update.user';

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
}
