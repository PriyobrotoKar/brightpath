import { JWTPayload } from '@/auth/types/jwt-payload';
import { AuthorityCheckerService } from '@/common/authority-checker.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaClient } from '@brightpath/db';
import ms, { StringValue } from 'ms';
import {
  BadRequestException,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private readonly prisma: PrismaClient;
  private readonly logger: LoggerService;
  constructor(
    private prismaService: PrismaService,
    private authorityChecker: AuthorityCheckerService,
  ) {
    this.prisma = this.prismaService.client;
    this.logger = new Logger(AnalyticsService.name);
  }

  async getTotalIncomeOfCourse(courseSlug: string, user: JWTPayload) {
    this.logger.log(
      `User ${user.id} requested to get total income of course ${courseSlug}`,
    );

    //check if the course exists and the user is the creator of that course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    // Get the total income
    const getTotalIncome = this.prisma.payment.aggregate({
      where: {
        order: {
          courseId: course.id,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get the total income till previous month
    const getTotalIncomeTillLastMonth = this.prisma.payment.aggregate({
      where: {
        order: {
          courseId: course.id,
        },
        createdAt: {
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const [totalIncome, totalIncomeTillLastMonth] = await Promise.all([
      getTotalIncome,
      getTotalIncomeTillLastMonth,
    ]);

    return {
      totalIncome: totalIncome._sum.amount || 0,
      totalIncomeTillLastMonth: totalIncomeTillLastMonth._sum.amount || 0,
    };
  }

  async getMonthlyIncomeOfCourse(courseSlug: string, user: JWTPayload) {
    this.logger.log(
      `User ${user.id} requested to get monthly income of course ${courseSlug}`,
    );

    //check if the course exists and the user is the creator of that course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    // Get the total income of current month
    const getCurrentMonthIncome = this.prisma.payment.aggregate({
      where: {
        order: {
          courseId: course.id,
        },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get the total income of previous month
    const getPreviousMonthIncome = this.prisma.payment.aggregate({
      where: {
        order: {
          courseId: course.id,
        },
        createdAt: {
          gt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const [currentMonthIncome, lastMonthIncome] = await Promise.all([
      getCurrentMonthIncome,
      getPreviousMonthIncome,
    ]);

    return {
      currentMonthIncome: currentMonthIncome._sum.amount || 0,
      lastMonthIncome: lastMonthIncome._sum.amount || 0,
    };
  }

  async getDailyIncomeOfCourse(
    courseSlug: string,
    range: string,
    user: JWTPayload,
  ) {
    this.logger.log(
      `User ${user.id} requested to get daily income of course ${courseSlug}`,
    );

    const rangeInMs = this.validateRange(range);

    //check if the course exists and the user is the creator of that course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    console.log(rangeInMs);
    const startDate = new Date(Date.now() - rangeInMs);
    startDate.setHours(0, 0, 0, 0);

    const dailyIncomes = await this.prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        order: {
          courseId: course.id,
        },
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return dailyIncomes.map((income) => ({
      amount: income._sum.amount,
      date: income.createdAt.toISOString().split('T')[0],
    }));
  }

  private validateRange(range: string) {
    try {
      const firstNonDigitIndex = range.search(/\D/);
      const unit = range.slice(firstNonDigitIndex).trim().toLowerCase();
      const isMonthUnit = ['months', 'month', 'mo'].includes(unit);

      if (isMonthUnit) {
        const months = parseInt(range.slice(0, firstNonDigitIndex));
        if (isNaN(months) || months <= 0) {
          throw new BadRequestException('Invalid range');
        }

        return months * 30 * 24 * 60 * 60 * 1000;
      }

      const milliseconds = ms(range as StringValue);

      if (milliseconds < 0) {
        throw new BadRequestException('Invalid range');
      }

      return milliseconds;
    } catch {
      throw new BadRequestException('Invalid range');
    }
  }
}
