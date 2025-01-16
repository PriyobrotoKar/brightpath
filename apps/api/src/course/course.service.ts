import { JWTPayload } from '@/auth/types/jwt-payload';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create.course';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePricingDto } from './dto/create.pricing';
import { Prisma } from '@brightpath/db';
import { CreateScheduleDto } from './dto/create.schedule';
import { UpdateEnrollmentDto } from './dto/update.enrollment';
import { createCategoryIfNotExist } from '@/common/category';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async getCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course:${courseId} not found!`);
    }

    return course;
  }

  async getCoursesForSelf(user: JWTPayload) {
    return await this.prisma.course.findMany({
      where: {
        creatorId: user.id,
      },
    });
  }

  async createCourse(user: JWTPayload, dto: CreateCourseDto) {
    const category = await createCategoryIfNotExist(dto.category, this.prisma);

    return await this.prisma.course.create({
      data: {
        name: dto.name,
        description: dto.description,
        categoryId: category.id,
        tags: dto.tags,
        logo: dto.logo,
        thumbnails: dto.thumbnails,
        creatorId: user.id,
      },
    });
  }

  async createPricing(
    user: JWTPayload,
    courseId: string,
    dto: CreatePricingDto,
  ) {
    await this.checkAuthority(courseId, user.id);
    let data: Prisma.PricingCreateInput | null = null;

    const isPricingAlreadyExist = await this.prisma.pricing.findUnique({
      where: {
        courseId,
      },
    });

    if (isPricingAlreadyExist) {
      throw new BadRequestException('Pricing already exist for this course');
    }

    if (dto.model === 'FREE') {
      return this.prisma.pricing.create({
        data: {
          paymentPlan: 'FREE',
          price: new Prisma.Decimal(0),
          courseId,
        },
      });
    }

    if (!dto.price) {
      throw new BadRequestException('Price is required for paid courses');
    }

    data = {
      paymentPlan: dto.model,
      price: new Prisma.Decimal(dto.price),
      course: { connect: { id: courseId } },
    };

    data = this.addDiscountToPricing(data, dto);

    data = await this.addCouponToPricing(data, dto);

    const pricing = await this.prisma.pricing.create({
      data,
    });

    return pricing;
  }

  async createSchedule(
    user: JWTPayload,
    courseId: string,
    dto: CreateScheduleDto,
  ) {
    const course = await this.checkAuthority(courseId, user.id);

    if (dto.course_type === 'COHORT' && (!dto.start_date || !dto.end_date)) {
      throw new BadRequestException(
        'Start date and end date are required for cohort courses',
      );
    }

    if (dto.course_type === 'RECORDED' && dto.sessions) {
      throw new BadRequestException(
        'Self paced course should not have sessions',
      );
    }

    if (course.Session.length) {
      throw new BadRequestException('Schedule already exist for this course');
    }

    const sessions: Prisma.SessionCreateWithoutCourseInput[] = [];

    const currentDate = new Date();
    const start_date = new Date(dto.start_date);
    const end_date = new Date(dto.end_date);
    if (start_date.getTime() < currentDate.getTime()) {
      throw new BadRequestException('Start date should be in the future');
    }
    if (end_date.getTime() < start_date.getTime()) {
      throw new BadRequestException('End date should be after start date');
    }

    if (dto.sessions.length) {
      for (const session of dto.sessions) {
        const start_time = new Date(session.start_time);
        const end_time = new Date(session.end_time);
        if (start_time > end_time) {
          throw new BadRequestException('End time should be after start time');
        }

        if (session.day_of_week < 0 || session.day_of_week > 6) {
          throw new BadRequestException('Invalid day of week');
        }

        if (session.start_time === session.end_time) {
          throw new BadRequestException(
            'Start time and end time cannot be same',
          );
        }

        const duration =
          new Date(session.end_time).getTime() -
          new Date(session.start_time).getTime();

        const endAt =
          end_time ||
          new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));

        sessions.push({
          name: 'Session',
          startAt: session.start_time,
          endAt: endAt,
          duration,
        });
      }
    }

    const updatedCourse = await this.prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        type: dto.course_type,
        startAt: dto.start_date,
        endAt: dto.end_date,
        accessDuration: dto.access_duration,
        Session: {
          createMany: {
            data: sessions,
          },
        },
      },
      include: {
        Session: true,
      },
    });

    await this.prisma.recurringDetails.createMany({
      data: dto.sessions.map((session, i) => ({
        dayOfWeek: session.day_of_week,
        rrule: 'FREQ=WEEKLY;BYDAY=' + session.day_of_week,
        endAt: updatedCourse.endAt,
        sessionId: updatedCourse.Session[i].id,
      })),
    });

    return updatedCourse;
  }

  async updateEnrollmentSettings(
    user: JWTPayload,
    courseId: string,
    dto: UpdateEnrollmentDto,
  ) {
    const course = await this.checkAuthority(courseId, user.id);

    if (dto.deadline) {
      if (!course.startAt || !course.endAt) {
        throw new BadRequestException(
          'Course start date and end date are required',
        );
      }

      if (
        new Date(dto.deadline) < new Date(course.startAt) ||
        new Date(dto.deadline) > new Date(course.endAt)
      ) {
        throw new BadRequestException(
          'Deadline should be within course start and end date',
        );
      }
    }

    const updatedCourse = await this.prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        accessType: dto.type,
        enrollmentDeadline: dto.deadline,
      },
    });

    return updatedCourse;
  }

  private async checkAuthority(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        Session: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course:${courseId} not found!`);
    }

    const hasAuthority = course.creatorId === userId;

    if (!hasAuthority) {
      throw new ForbiddenException(
        `User:${userId} does not have the required permission`,
      );
    }

    return course;
  }

  private addDiscountToPricing(
    data: Prisma.PricingCreateInput,
    dto: CreatePricingDto,
  ) {
    if (dto.discount_enabled) {
      if (!dto.discount_type || !dto.discount_value) {
        throw new BadRequestException(
          'Discount type and value are required for discount',
        );
      }

      return {
        ...data,
        discountEnabled: dto.discount_enabled,
        discountType: dto.discount_type,
        discountValue: dto.discount_value,
      };
    }

    return data;
  }

  private async addCouponToPricing(
    data: Prisma.PricingCreateInput,
    dto: CreatePricingDto,
  ) {
    if (dto.coupon_enabled) {
      if (!dto.coupon_type || !dto.coupon_value || !dto.coupon_code) {
        throw new BadRequestException(
          'Coupon type, value and code are required for coupon',
        );
      }

      const isCouponExist = await this.prisma.coupon.findUnique({
        where: {
          code: dto.coupon_code,
        },
      });

      if (isCouponExist) {
        throw new BadRequestException('Coupon code already exist');
      }

      return {
        ...data,
        coupons: {
          create: {
            discountType: dto.coupon_type,
            discountValue: dto.coupon_value,
            code: dto.coupon_code,
          },
        },
      };
    }

    return data;
  }
}
