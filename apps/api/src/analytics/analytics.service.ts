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

  async getMostCompletedLesson(courseSlug: string, user: JWTPayload) {
    this.logger.log(
      `Creator ${user.id} requested to get most completed lesson for course ${courseSlug}`,
    );

    // Check if the user has authority over the course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    const query = {
      where: {
        module: {
          courseId: course.id,
        },
      },
      include: {
        module: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedCount: 'desc',
      },
    } as const;

    // Find the document which has the higest completion
    const document = await this.prisma.document.findFirst(query);

    // Find the video which has the highest completion
    const video = await this.prisma.video.findFirst(query);

    const videoLesson = {
      ...video,
      type: 'video',
    };

    const documentLesson = {
      ...document,
      type: 'document',
    };

    const maxCompletion = Math.max(
      document.completedCount,
      video.completedCount,
    );

    const lesson = [videoLesson, documentLesson].find(
      (lesson) => lesson.completedCount === maxCompletion,
    );

    this.logger.log(
      `Most completed lesson for course ${courseSlug} is ${lesson.id}`,
    );

    // Return the maximum of the two
    return {
      lesson,
      completedCount: maxCompletion,
    };
  }

  async getLeastCompletedLesson(courseSlug: string, user: JWTPayload) {
    this.logger.log(
      `Creator ${user.id} requested to get least completed lesson for course ${courseSlug}`,
    );

    // Check if the user has authority over the course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    const query = {
      where: {
        module: {
          courseId: course.id,
        },
      },
      include: {
        module: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedCount: 'desc',
      },
    } as const;

    // Find the document which has the lowest completion
    const document = await this.prisma.document.findFirst(query);

    // Find the video which has the lowest completion
    const video = await this.prisma.video.findFirst(query);

    const videoLesson = {
      ...video,
      type: 'video',
    };

    const documentLesson = {
      ...document,
      type: 'document',
    };

    const minCompletion = Math.min(
      document.completedCount,
      video.completedCount,
    );

    const lesson = [videoLesson, documentLesson].find(
      (lesson) => lesson.completedCount === minCompletion,
    );

    this.logger.log(
      `Least completed lesson for course ${courseSlug} is ${lesson.id}`,
    );

    // Return the minimum of the two
    return {
      lesson,
      completedCount: minCompletion,
    };
  }

  async getAverageCompletionRate(courseSlug: string, user: JWTPayload) {
    this.logger.log(
      `Creator ${user.id} requested to get average completion rate for course ${courseSlug}`,
    );

    // Check if the user has authority over the course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    const now = new Date();

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [completedStudents, lastMonthCompletedStudents, enrolledStudents] =
      await Promise.all([
        this.prisma.user.count({
          where: {
            courses: {
              some: {
                id: course.id,
              },
            },
            courseCompletedAt: {
              not: null,
            },
          },
        }),
        this.prisma.user.count({
          where: {
            courses: {
              some: {
                id: course.id,
              },
            },
            courseCompletedAt: {
              gte: startOfLastMonth,
              lt: startOfThisMonth,
            },
          },
        }),
        this.prisma.user.count({
          where: {
            courses: {
              some: {
                id: course.id,
              },
            },
          },
        }),
      ]);

    // Return the result of division of the number of students with completed lessons by the total number of students
    return {
      completionRate: completedStudents / enrolledStudents,
      lastMonthCompletionRate: lastMonthCompletedStudents / enrolledStudents,
    };
  }

  async getTotalEnrollments(courseSlug: string, user: JWTPayload) {
    this.logger.log(
      `User ${user.id} requested to get total enrollments for course ${courseSlug}`,
    );

    // Check if the user is authorized to access the course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    // Get the total lifetime enrollment count and enrollment count till last month in parallel
    const [totalEnrollments, tillLastMonthEnrollments] = await Promise.all([
      this.prisma.enrollment.count({
        where: {
          courseId: course.id,
        },
      }),
      this.prisma.enrollment.count({
        where: {
          courseId: course.id,
          createdAt: {
            lt: new Date(new Date().setMonth(new Date().getMonth())),
          },
        },
      }),
    ]);

    this.logger.log(
      `Fetched total enrollments: ${totalEnrollments} and till last month enrollments: ${tillLastMonthEnrollments} for course ${courseSlug}`,
    );

    // return the total and tillLastMonth values
    return {
      total: totalEnrollments,
      tillLastMonth: tillLastMonthEnrollments,
    };
  }

  async getNewEnrollments(courseSlug: string, user: JWTPayload) {
    this.logger.log(
      `User ${user.id} requested to get new enrollments for course ${courseSlug}`,
    );

    // Check if the user is authorized to access the course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    // Get the enrollment count of this month and last month in parallel
    const [currentMonthEnrollmentCount, lastMonthEnrollmentCount] =
      await Promise.all([
        this.prisma.enrollment.count({
          where: {
            courseId: course.id,
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth())),
            },
          },
        }),
        this.prisma.enrollment.count({
          where: {
            courseId: course.id,
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        }),
      ]);

    this.logger.log(
      `Fetched new enrollments: ${currentMonthEnrollmentCount} and last month new enrollments: ${lastMonthEnrollmentCount} for course ${courseSlug}`,
    );

    // return the currentMonth and lastMonth values
    return {
      currentMonth: currentMonthEnrollmentCount,
      lastMonth: lastMonthEnrollmentCount,
    };
  }

  async getActiveLearners(courseSlug: string, user: JWTPayload) {
    // Check if the user is authorized to access the course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    // An active learner = a learner who performed at least one meaningful learning action in the last 7 days
    // Get the total number of learners in the course
    // Get the active learner count of this week
    // Get the active learner count of last week
    const [totalLearners, activeLearnersThisWeek, activeLearnersLastWeek] =
      await Promise.all([
        this.prisma.enrollment.count({
          where: {
            courseId: course.id,
          },
        }),
        this.prisma.userActivity.count({
          where: {
            courseId: course.id,
            activityDate: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        }),
        this.prisma.userActivity.count({
          where: {
            courseId: course.id,
            activityDate: {
              gte: new Date(new Date().setDate(new Date().getDate() - 14)),
              lt: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        }),
      ]);

    // return the currentWeek and lastWeek values
    return {
      currentWeek: activeLearnersThisWeek / totalLearners,
      lastWeek: activeLearnersLastWeek / totalLearners,
    };
  }

  async getDailyEnrollments(
    courseSlug: string,
    range: string,
    user: JWTPayload,
  ) {
    this.logger.log(
      `User ${user.id} requested daily enrollments for course ${courseSlug} in range ${range}`,
    );

    const rangeInMs = this.validateRange(range);

    //check if the course exists and the user is the creator of that course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    const startDate = new Date(Date.now() - rangeInMs);
    startDate.setHours(0, 0, 0, 0);

    const dailyEnrollments = await this.prisma.enrollment.groupBy({
      by: ['createdAt'],
      where: {
        courseId: course.id,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    return dailyEnrollments.map((enrollment) => ({
      amount: enrollment._count.id,
      date: enrollment.createdAt.toISOString().split('T')[0],
    }));
  }

  async getDailyActiveLearners(
    courseSlug: string,
    range: string,
    user: JWTPayload,
  ) {
    const rangeInMs = this.validateRange(range);

    //check if the course exists and the user is the creator of that course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    const startDate = new Date(Date.now() - rangeInMs);
    startDate.setHours(0, 0, 0, 0);

    const dailyActiveLearners = await this.prisma.userActivity.groupBy({
      by: ['activityDate'],
      where: {
        courseId: course.id,
        activityDate: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    return dailyActiveLearners.map((learner) => ({
      amount: learner._count.id,
      date: learner.activityDate.toISOString().split('T')[0],
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
