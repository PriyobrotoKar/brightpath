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

  @Get('content/most-completed/:slug')
  async getMostCompletedLesson(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getMostCompletedLesson(slug, currentUser);
  }

  @Get('content/least-completed/:slug')
  async getLeastCompletedLesson(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getLeastCompletedLesson(slug, currentUser);
  }

  @Get('content/average-completion-rate/:slug')
  async getAverageCompletionRate(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getAverageCompletionRate(slug, currentUser);
  }

  @Get('enrollment/total/:slug')
  async getTotalEnrollments(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getTotalEnrollments(slug, currentUser);
  }

  @Get('enrollment/new/:slug')
  async getTotalNewEnrollments(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getNewEnrollments(slug, currentUser);
  }

  @Get('enrollment/active/:slug')
  async getActiveLearners(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getActiveLearners(slug, currentUser);
  }

  @Get('enrollment/daily/:slug')
  async getDailyEnrollmentsOfCourse(
    @Param('slug') slug: string,
    @Query('range') range: string = '7d',
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getDailyEnrollments(slug, range, currentUser);
  }

  @Get('enrollment/daily/active/:slug')
  async getDailyActiveLearners(
    @Param('slug') slug: string,
    @Query('range') range: string = '7d',
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.analyticsService.getDailyActiveLearners(
      slug,
      range,
      currentUser,
    );
  }
}
