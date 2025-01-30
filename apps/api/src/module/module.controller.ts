import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ModuleService } from './module.service';
import { Creator } from '@/decorators/role.decorator';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { CreateModuleDto } from './dto/create.module';
import { ModuleFilterDto } from './dto/filter.module';

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
    @Query() queryParams: ModuleFilterDto,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.moduleService.getModules(user, courseId, {
      filters: { status: queryParams.status, createdAt: queryParams.createdAt },
      sort: queryParams.sort,
    });
  }
}
