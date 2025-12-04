import { Controller, Get, Param, Query } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { Roles } from '@/decorators/role.decorator';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Roles('CREATOR')
  @Get('all/:courseSlug')
  async getAllEnrollmentsByCourseSlug(
    @Param('courseSlug') courseSlug: string,
    @CurrentUser() user: JWTPayload,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @Query('search') search: string = '',
  ) {
    return this.enrollmentService.getEnrollments(
      courseSlug,
      page,
      limit,
      sort,
      order,
      search,
      user,
    );
  }
}
