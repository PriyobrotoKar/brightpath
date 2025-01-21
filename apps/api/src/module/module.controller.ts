import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ModuleService } from './module.service';
import { Creator } from '@/decorators/role.decorator';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { CreateModuleDto } from './dto/create.module';

@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Creator()
  @Post(':courseId')
  async createModule(
    @CurrentUser() user: JWTPayload,
    @Body() dto: CreateModuleDto,
    @Param('courseId') courseId: string,
  ) {
    return this.moduleService.createModule(user, dto, courseId);
  }

  @Get(':courseId')
  async getModules(
    @Param('courseId') courseId: string,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.moduleService.getModules(user, courseId);
  }
}
