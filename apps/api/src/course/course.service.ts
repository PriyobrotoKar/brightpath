import { JWTPayload } from '@/auth/types/jwt-payload';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create.course';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePricingDto } from './dto/create.pricing';
import { Currency, MerchantStatus, Prisma, PrismaClient } from '@brightpath/db';
import { CreateScheduleDto } from './dto/create.schedule';
import { UpdateEnrollmentDto } from './dto/update.enrollment';
import { createCategoryIfNotExist } from '@/common/category';
import { AuthorityCheckerService } from '@/common/authority-checker.service';
import { UpdateCourseDto } from './dto/update.course';
import { UpdatePricingDto } from './dto/update.pricing';
import { UpdateScheduleDto } from './dto/update.schedule';
import { CacheService } from '@/cache/cache.service';
import { getUserByEmailOrId } from '@/common/user';
import { slugify, sortLessons } from '@/common/utils';
import { generateSlug } from 'random-word-slugs';
import { calcuateCostVariables } from '@/common/pricing';

@Injectable()
export class CourseService {
  private readonly prisma: PrismaClient;
  private readonly logger: LoggerService;

  constructor(
    private prismaService: PrismaService,
    private authorityChecker: AuthorityCheckerService,
    private cacheService: CacheService,
  ) {
    this.prisma = this.prismaService.client;
    this.logger = new Logger(CourseService.name);
  }

  async getCourse(identifier: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [
          {
            id: identifier,
          },
          {
            slug: identifier,
          },
        ],
      },
      include: {
        category: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course:${identifier} not found!`);
    }

    return course;
  }

  async getCourseMetadata(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        slug,
      },
      include: {
        category: true,
        creator: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course:${slug} not found!`);
    }

    // Get counts for video, articles and assignments
    const [videoCount, documentCount, assignmentCount] = await Promise.all([
      this.prisma.video.count({
        where: {
          module: {
            courseId: course.id,
          },
        },
      }),
      this.prisma.document.count({
        where: {
          module: {
            courseId: course.id,
          },
        },
      }),
      this.prisma.assignment.count({
        where: {
          module: {
            courseId: course.id,
          },
        },
      }),
    ]);

    return {
      ...course,
      lessonCount: {
        video: videoCount,
        assignment: assignmentCount,
        document: documentCount,
        total: videoCount + assignmentCount + documentCount,
      },
    };
  }

  async getCoursesForSelf(user: JWTPayload) {
    return await this.prisma.course.findMany({
      where: {
        creatorId: user.id,
      },
    });
  }

  async getEnrolledCourses(user: JWTPayload, tenantSlug: string) {
    const enrolledCourses = await this.prisma.course.findMany({
      where: {
        creator: {
          merchant: {
            slug: tenantSlug,
          },
        },
        enrollments: {
          some: {
            userId: user.id,
          },
        },
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        slug: true,
        category: true,
      },
    });

    return enrolledCourses;
  }

  async createCourse(user: JWTPayload, dto: CreateCourseDto) {
    const category = await createCategoryIfNotExist(dto.category, this.prisma);
    const slug = await this.generateSlug(dto.name);

    return await this.prisma.course.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug,
        level: dto.level,
        categoryId: category.id,
        tags: dto.tags,
        logo: dto.logo,
        thumbnails: dto.thumbnails,
        creatorId: user.id,
      },
    });
  }

  async updateCourse(
    user: JWTPayload,
    courseSlug: string,
    dto: UpdateCourseDto,
  ) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    const category = await createCategoryIfNotExist(dto.category, this.prisma);
    const slug =
      dto.name !== course.name
        ? await this.generateSlug(dto.name)
        : course.slug;

    return await this.prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        name: dto.name,
        description: dto.description,
        slug,
        categoryId: category.id,
        tags: dto.tags,
        logo: dto.logo,
        thumbnails: dto.thumbnails,
      },
    });
  }

  async createPricing(
    user: JWTPayload,
    courseSlug: string,
    dto: CreatePricingDto,
  ) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );
    let data: Prisma.PricingCreateInput | null = null;

    const isPricingAlreadyExist = await this.prisma.pricing.findUnique({
      where: {
        courseId: course.id,
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
          courseId: course.id,
        },
      });
    }

    if (!dto.price) {
      throw new BadRequestException('Price is required for paid courses');
    }

    data = {
      paymentPlan: dto.model,
      price: new Prisma.Decimal(dto.price),
      course: { connect: { id: course.id } },
    };

    data = this.addDiscountToPricing(data, dto);

    data = await this.addCouponToPricing(data, dto);

    const pricing = await this.prisma.pricing.create({
      data,
    });

    return pricing;
  }

  async updateCoursePricing(
    user: JWTPayload,
    courseId: string,
    dto: UpdatePricingDto,
  ) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseId,
      user,
    );

    const pricing = await this.prisma.pricing.findUnique({
      where: {
        courseId: course.id,
      },
    });

    if (!pricing) {
      throw new NotFoundException('Pricing not found');
    }

    let updatedData = {
      paymentPlan: dto.model,
      price: new Prisma.Decimal(dto.price),
    };

    updatedData = this.addDiscountToPricing(updatedData, dto);

    updatedData = await this.addCouponToPricing(updatedData, dto);

    const updatedPricing = await this.prisma.pricing.update({
      where: {
        id: pricing.id,
      },
      data: updatedData,
    });

    return updatedPricing;
  }

  async getCoursePricing(courseId: string) {
    const course = await this.getCourse(courseId);

    const pricing = await this.prisma.pricing.findUnique({
      where: {
        courseId: course.id,
      },
    });

    const costs = calcuateCostVariables(pricing, course.slug, this.logger);

    delete pricing.price;

    return {
      ...costs,
      ...pricing,
      currency: Currency.INR,
    };
  }

  async getCourseCoupons(courseId: string, user: JWTPayload) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseId,
      user,
    );

    const coupons = await this.prisma.coupon.findMany({
      where: {
        pricing: {
          courseId: course.id,
        },
      },
    });

    return coupons;
  }

  async createSchedule(
    user: JWTPayload,
    courseSlug: string,
    dto: CreateScheduleDto,
  ) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    const hasSessions =
      (await this.prisma.session.count({
        where: {
          courseId: course.id,
        },
      })) > 0;

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

    if (hasSessions) {
      throw new BadRequestException('Schedule already exist for this course');
    }

    const currentDate = new Date();
    const start_date = new Date(dto.start_date);
    const end_date = new Date(dto.end_date);
    if (start_date.getTime() < currentDate.getTime()) {
      throw new BadRequestException('Start date should be in the future');
    }
    if (end_date.getTime() < start_date.getTime()) {
      throw new BadRequestException('End date should be after start date');
    }

    const sessions: Prisma.SessionCreateWithoutCourseInput[] = dto.sessions
      .length
      ? this.formatSessions(dto.sessions)
      : [];

    const updatedCourse = await this.prisma.course.update({
      where: {
        id: course.id,
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

  async updateCourseSchedule(
    dto: UpdateScheduleDto,
    courseId: string,
    user: JWTPayload,
  ) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseId,
      user,
    );

    //TODO: creator cannot change the course type if the there is atleast one learner enrolled
    // This will be implemented in a future release

    // if the user is switching course type from live to self-paced, delete all sessions
    if (course.type === 'COHORT' && dto.course_type === 'RECORDED') {
      await this.prisma.session.deleteMany({
        where: {
          courseId: course.id,
        },
      });
    }

    const updatedCourse = await this.prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        type: dto.course_type,
        startAt: dto.start_date,
        endAt: dto.end_date,
        accessDuration: dto.access_duration,
      },
    });

    if (dto.sessions.length && dto.course_type === 'COHORT') {
      const formattedSessions = this.formatSessions(dto.sessions);
      const ids = dto.sessions
        .map((session) => session.id)
        .filter((session) => session !== undefined);

      // delete previous sessions
      await this.prisma.session.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      // create new sessions
      const sessions = await this.prisma.session.createManyAndReturn({
        data: formattedSessions.map((session) => ({
          ...session,
          courseId: updatedCourse.id,
        })),
      });

      // create recurring details
      await this.prisma.recurringDetails.createMany({
        data: dto.sessions.map((session, i) => ({
          dayOfWeek: session.day_of_week,
          rrule: 'FREQ=WEEKLY;BYDAY=' + session.day_of_week,
          endAt: updatedCourse.endAt,
          sessionId: sessions[i].id,
        })),
      });
    }

    return updatedCourse;
  }

  async updateEnrollmentSettings(
    user: JWTPayload,
    courseSlug: string,
    dto: UpdateEnrollmentDto,
  ) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

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
        id: course.id,
      },
      data: {
        accessType: dto.type,
        enrollmentDeadline: dto.deadline,
      },
    });

    return updatedCourse;
  }

  private addDiscountToPricing<
    T extends Prisma.PricingCreateInput | Prisma.PricingUpdateInput,
    K extends CreatePricingDto | UpdatePricingDto,
  >(data: T, dto: K) {
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

  private async addCouponToPricing<
    T extends Prisma.PricingCreateInput | Prisma.PricingUpdateInput,
    K extends CreatePricingDto | UpdatePricingDto,
  >(data: T, dto: K) {
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

  async getCourseSchedule(id: string, user: JWTPayload) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      id,
      user,
    );

    const sessions = await this.prisma.session.findMany({
      where: {
        courseId: course.id,
      },
      include: {
        RecurringDetails: true,
      },
    });

    return {
      ...course,
      Session: sessions,
    };
  }

  async publishCourse(id: string, user: JWTPayload) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      id,
      user,
    );

    //check if the course is already published or not
    if (course.isPublished) {
      throw new BadRequestException('Course is already published');
    }

    // check if the following requirements are met before publishing
    // check if the course details are filled like title, thumbnail, description, outcomes etc.
    // check if there are atleast 3 lessons added
    // check if payout details are added
    // check if pricing is set
    // check if personal info is filled

    // perform 3 queries: Get merchant status, profile, modules and pricing
    const [profile, merchant, videosCount, documentsCount, pricing] =
      await Promise.all([
        getUserByEmailOrId(user.id, this.prisma, this.cacheService),
        this.prisma.merchant.findUnique({
          where: {
            creatorId: user.id,
            status: MerchantStatus.ACTIVE,
          },
        }),
        this.prisma.video.count({
          where: {
            module: {
              courseId: id,
            },
          },
        }),
        this.prisma.document.count({
          where: {
            module: {
              courseId: id,
            },
          },
        }),
        this.prisma.pricing.findUnique({
          where: {
            courseId: course.id,
          },
        }),
      ]);

    const lessonCount = videosCount + documentsCount;
    const isProfileInfoProvided =
      profile.name && profile.bio && profile.phone && profile.profilePicture;

    if (!merchant || lessonCount < 3 || !pricing || !isProfileInfoProvided)
      throw new ForbiddenException(
        'Requirements are not met. Please ensure that all the required information is filled.',
      );

    // Publish course
    const publishedCourse = await this.prisma.course.update({
      where: { id },
      data: {
        isPublished: true,
      },
    });

    return publishedCourse;
  }

  async getAllLessonDetails(slug: string, currentUser: JWTPayload | null) {
    const course = await this.prisma.course.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        Module: {
          select: {
            id: true,
            name: true,
            Video: {
              select: {
                id: true,
                name: true,
                duration: true,
                createdAt: true,
                completedBy: {
                  where: {
                    id: currentUser?.id ?? '',
                  },
                },
              },
            },
            Document: {
              select: {
                id: true,
                name: true,
                duration: true,
                createdAt: true,
                completedBy: {
                  where: {
                    id: currentUser?.id ?? '',
                  },
                },
              },
            },
            Assignment: {
              select: {
                id: true,
                createdAt: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with slug:${slug} not found`);
    }

    let isEnrolled = false;

    if (currentUser && currentUser.role === 'STUDENT') {
      isEnrolled = !!(await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: currentUser.id,
            courseId: course.id,
          },
        },
      }));
    }

    const structuredModules = course.Module.map((module) => {
      let sortedLessons = sortLessons([
        module.Document,
        module.Video,
        module.Assignment,
      ]);

      if (isEnrolled) {
        sortedLessons = sortedLessons.map(({ completedBy, ...lesson }) => {
          return {
            ...lesson,
            isCompleted: completedBy?.length > 0,
          };
        });
      } else {
        sortedLessons = sortedLessons.map((lesson) => {
          delete lesson.completedBy;
          return lesson;
        });
      }

      return {
        id: module.id,
        name: module.name,
        lessons: sortedLessons,
        duration: sortedLessons.reduce(
          (acc, lesson) => acc + (lesson.duration ?? 0),
          0,
        ),
      };
    });

    return {
      totalLectures: structuredModules.reduce(
        (acc, module) => acc + module.lessons.length,
        0,
      ),
      totalModules: structuredModules.length,
      totalDuration: structuredModules.reduce(
        (acc, module) => acc + module.duration,
        0,
      ),
      modules: structuredModules,
    };
  }

  private formatSessions<T extends CreateScheduleDto | UpdateScheduleDto>(
    sessions: T['sessions'],
  ) {
    const currentDate = new Date();
    const formattedSessions: Prisma.SessionCreateWithoutCourseInput[] = [];

    for (const session of sessions) {
      const start_time = new Date(session.start_time);
      const end_time = new Date(session.end_time);
      if (start_time > end_time) {
        throw new BadRequestException('End time should be after start time');
      }

      if (session.day_of_week < 0 || session.day_of_week > 6) {
        throw new BadRequestException('Invalid day of week');
      }

      if (session.start_time === session.end_time) {
        throw new BadRequestException('Start time and end time cannot be same');
      }

      const duration =
        new Date(session.end_time).getTime() -
        new Date(session.start_time).getTime();

      const endAt =
        end_time ||
        new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));

      formattedSessions.push({
        name: 'Session',
        startAt: session.start_time,
        endAt: endAt,
        duration,
      });
    }

    return formattedSessions;
  }

  private async generateSlug(input: string): Promise<string> {
    const baseSlug = slugify(input);
    let existingSlugs: string[] | null = null;

    // Check if slugs already exist in the cache
    existingSlugs = await this.cacheService.getCachedValue<string[]>(
      'slug',
      `course:${baseSlug}`,
    );

    if (!existingSlugs) {
      // Get all the slugs that starts with baseSlug
      const slugs = await this.prisma.course.findMany({
        where: {
          slug: {
            startsWith: baseSlug,
          },
        },
        select: {
          slug: true,
        },
      });

      if (slugs.length !== 0) {
        existingSlugs = slugs
          .filter(({ slug }) => slug !== baseSlug)
          .map(({ slug }) => {
            const index = slug.lastIndexOf('-');
            return slug.slice(index + 1);
          });
      }
    }

    const slugsSet = new Set(existingSlugs);

    let newSlug = baseSlug;

    // if existingSlugs is an Array that means at least the slug is used one time
    // we have to create a new word and check if the slug exists in cached result or not
    if (existingSlugs) {
      const MAX_RETRIES = 10;
      let retries = 0;
      while (retries < MAX_RETRIES) {
        const randomWord = generateSlug(1);
        if (!slugsSet.has(randomWord)) {
          newSlug = slugify(`${input} ${randomWord}`);

          // check if the slug is present in the DB due to race-conditions
          const slugExists = await this.prisma.course.findUnique({
            where: {
              slug: newSlug,
            },
          });

          if (!slugExists) {
            slugsSet.add(randomWord);
            break;
          }
        }

        retries++;
      }
    }

    // add the random word in the cache for 1 day
    await this.cacheService.setCache(
      'slug',
      `course:${baseSlug}`,
      Array.from(slugsSet),
      60 * 60 * 24,
    );

    // if does not exist, then return the slug
    return newSlug;
  }
}
