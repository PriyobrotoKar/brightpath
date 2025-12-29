import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { Roles } from '@/decorators/role.decorator';

@Roles('CREATOR')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue/total/:slug')
  async getTotalIncomeOfCourse(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getTotalIncomeOfCourse(slug, currentUser);
  }

  @Get('revenue/monthly/:slug')
  async getMonthlyIncomeOfCourse(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getMonthlyIncomeOfCourse(slug, currentUser);
  }

  @Get('revenue/daily/:slug')
  async getDailyIncomeOfCourse(
    @Param('slug') slug: string,
    @Query('range') range: string = '7d',
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getDailyIncomeOfCourse(
      slug,
      range,
      currentUser,
    );
  }
}
