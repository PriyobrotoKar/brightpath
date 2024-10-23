import { JWTPayload } from '@/auth/types/jwt-payload';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create.course';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePricingDto } from './dto/create.pricing';
import { Prisma } from '@brightpath/db';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async createCourse(user: JWTPayload, dto: CreateCourseDto) {
    const category = await this.createCategoryIfNotExist(dto.category);

    return await this.prisma.course.create({
      data: {
        name: dto.name,
        description: dto.description,
        categoryId: category.id,
        tags: dto.tags,
        banner: dto.banner,
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
          price: 0,
          courseId,
        },
      });
    }

    if (!dto.price) {
      throw new BadRequestException('Price is required for paid courses');
    }

    data = {
      paymentPlan: dto.model,
      price: dto.price,
      course: { connect: { id: courseId } },
    };

    data = this.addDiscountToPricing(data, dto);

    data = await this.addCouponToPricing(data, dto);

    const pricing = await this.prisma.pricing.create({
      data,
    });

    return pricing;
  }

  private async createCategoryIfNotExist(name: string) {
    let category = await this.prisma.category.findUnique({
      where: { name },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: { name },
      });
    }

    return category;
  }

  private async checkAuthority(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new BadRequestException('No course found!');
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
  }
}
