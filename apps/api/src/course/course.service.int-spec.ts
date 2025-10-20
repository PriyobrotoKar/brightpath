import { Test } from '@nestjs/testing';
import { CourseModule } from './course.module';
import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { createUser } from '@/common/user';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaClient, User } from '@brightpath/db';
import { generateJwtTokens } from '@/common/utils';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from '@/auth/config/refresh-jwt.config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { CacheService } from '@/cache/cache.service';

describe('Course Controller Tests', () => {
  let app: NestApplication;
  let prisma: PrismaClient;
  let jwtService: JwtService;
  let cacheService: CacheService;

  let studentTestUser: User;
  let creatorTestUser1: User;
  let creatorTestUser2: User;
  let testCourse: {
    id: string;
    slug: string;
  };
  let headers: Record<string, string>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CourseModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService).client;
    jwtService = moduleRef.get(JwtService);
    cacheService = moduleRef.get(CacheService);

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    await cacheService.deleteAllCachedValues('slug');

    await prisma.user.deleteMany();
    [studentTestUser, creatorTestUser1, creatorTestUser2] = await Promise.all([
      createUser({ email: 'johndoe@gmail.com', role: 'STUDENT' }, prisma),
      createUser({ email: 'janedoe@gmail.com' }, prisma),
      createUser({ email: 'alice@gmail.com' }, prisma),
    ]);
    const jwtTokens = await generateJwtTokens(
      creatorTestUser1,
      jwtService,
      refreshJwtConfig(),
    );
    headers = { Authorization: `Bearer ${jwtTokens.access_token}` };

    await app.init();
  });

  afterAll(async () => {
    await cacheService.onModuleDestroy();
  });

  describe('/course', () => {
    it('should not create course if user is not creator', async () => {
      const jwtTokens = await generateJwtTokens(
        studentTestUser,
        jwtService,
        refreshJwtConfig(),
      );
      const headers = { Authorization: `Bearer ${jwtTokens.access_token}` };

      const response = await request(app.getHttpServer())
        .post('/course')
        .set(headers)
        .send({
          name: 'Test Course',
          description: 'Test Description',
          category: 'Test Category',
        });

      expect(response.status).toBe(403);
    });

    it('should not create a course if name or category or level is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/course')
        .set(headers)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
        'category must be a string',
        'level must be one of the following values: BEGINNER, INTERMEDIATE, EXPERT',
      ]);
    });

    it('should create a new course', async () => {
      const response = await request(app.getHttpServer())
        .post('/course')
        .set(headers)
        .send({
          name: 'Test Course',
          category: 'Test Category',
          level: 'BEGINNER',
        });

      testCourse = {
        id: response.body.id,
        slug: response.body.slug,
      };

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'Test Course',
        slug: 'test-course',
        description: null,
        tagline: null,
        level: 'BEGINNER',
        categoryId: expect.any(Number),
        tags: [],
        logo: null,
        thumbnails: [],
        accessType: 'EVERYONE',
        accessDuration: null,
        enrollmentDeadline: null,
        endAt: null,
        startAt: null,
        type: 'RECORDED',
        isPublished: false,
        creatorId: creatorTestUser1.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should create a new category', async () => {
      const category = await prisma.category.findUnique({
        where: {
          name: 'Test Category',
        },
      });

      expect(category).toBeDefined();
    });
  });

  describe('/course/:id/pricing', () => {
    afterEach(async () => {
      await prisma.pricing.deleteMany();
    });

    it('should not create pricing if course does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/course/invalid_id/pricing')
        .set(headers)
        .send({
          model: 'FREE',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual(`Course:invalid_id not found!`);
    });

    it('should not create pricing if user does not owns the course', async () => {
      const jwtTokens = await generateJwtTokens(
        creatorTestUser2,
        jwtService,
        refreshJwtConfig(),
      );
      const headers = { Authorization: `Bearer ${jwtTokens.access_token}` };

      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/pricing`)
        .set(headers)
        .send({
          model: 'FREE',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toEqual(
        `User:${creatorTestUser2.id} does not have the required permission`,
      );
    });

    it('should throw error if pricing already exists for the course', async () => {
      await prisma.pricing.create({
        data: {
          courseId: testCourse.id,
          paymentPlan: 'FREE',
          price: 0,
        },
      });
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/pricing`)
        .set(headers)
        .send({
          model: 'FREE',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Pricing already exist for this course',
      );
    });

    it('should throw error if price is not provided for paid courses', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/pricing`)
        .set(headers)
        .send({
          model: 'ONETIME',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Price is required for paid courses');
    });

    it('should create a new pricing for free course', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/pricing`)
        .set(headers)
        .send({
          model: 'FREE',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        paymentPlan: 'FREE',
        price: '0',
        discountEnabled: false,
        discountType: null,
        discountValue: null,
        courseId: testCourse.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should throw error if discount value is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/pricing`)
        .set(headers)
        .send({
          model: 'ONETIME',
          price: 100,
          discount_enabled: true,
          discount_type: 'PERCENTAGE',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Discount type and value are required for discount',
      );
    });

    it('should throw error if coupon value is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/pricing`)
        .set(headers)
        .send({
          model: 'ONETIME',
          price: 100,
          coupon_enabled: true,
          coupon_type: 'PERCENTAGE',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Coupon type, value and code are required for coupon',
      );
    });

    it('should create a new pricing for paid course', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/pricing`)
        .set(headers)
        .send({
          model: 'ONETIME',
          price: 100,
          discount_enabled: true,
          discount_type: 'PERCENTAGE',
          discount_value: 10,
          coupon_enabled: true,
          coupon_type: 'PERCENTAGE',
          coupon_value: 10,
          coupon_code: 'TESTCODE',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        paymentPlan: 'ONETIME',
        price: '100',
        discountEnabled: true,
        discountType: 'PERCENTAGE',
        discountValue: '10',
        courseId: testCourse.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should throw error if courpon code already exists', async () => {
      await prisma.course.create({
        data: {
          name: 'Test Course 2',
          level: 'BEGINNER',
          slug: 'test-course-2',
          category: {
            connectOrCreate: {
              where: {
                name: 'Test Category 2',
              },
              create: {
                name: 'Test Category 2',
              },
            },
          },
          creator: {
            connect: {
              id: creatorTestUser1.id,
            },
          },
          pricing: {
            create: {
              paymentPlan: 'ONETIME',
              price: 100,
              coupons: {
                create: {
                  code: 'TESTCODE',
                  discountType: 'PERCENTAGE',
                  discountValue: 10,
                },
              },
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/pricing`)
        .set(headers)
        .send({
          model: 'ONETIME',
          price: 100,
          coupon_enabled: true,
          coupon_type: 'PERCENTAGE',
          coupon_value: 10,
          coupon_code: 'TESTCODE',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Coupon code already exist');
    });
  });

  describe('/course/:id/schedule', () => {
    const start_date = new Date(new Date().setDate(new Date().getDate() + 1));
    const end_date = new Date(new Date().setDate(new Date().getDate() + 2));

    afterEach(async () => {
      await prisma.session.deleteMany();
    });

    it('should not create schedule if course does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/course/invalid_id/schedule')
        .set(headers)
        .send({
          course_type: 'RECORDED',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual(`Course:invalid_id not found!`);
    });

    it('should not create schedule if user does not owns the course', async () => {
      const jwtTokens = await generateJwtTokens(
        creatorTestUser2,
        jwtService,
        refreshJwtConfig(),
      );
      const headers = { Authorization: `Bearer ${jwtTokens.access_token}` };

      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'RECORDED',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toEqual(
        `User:${creatorTestUser2.id} does not have the required permission`,
      );
    });

    it('should throw error if start and end dates are not provided for cohort courses', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'COHORT',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Start date and end date are required for cohort courses',
      );
    });

    it('should throw error if self paced course has sessions', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'RECORDED',
          sessions: [
            {
              day_of_week: 1,
              start_time: '10:00',
              end_time: '12:00',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Self paced course should not have sessions',
      );
    });

    it('should throw error if schedule already exists for the course', async () => {
      await prisma.session.create({
        data: {
          courseId: testCourse.id,
          name: 'session',
          startAt: '2024-11-19T18:30:00.000Z',
          endAt: '2024-11-19T20:30:00.000Z',
          duration: 2,
        },
      });
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'RECORDED',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Schedule already exist for this course',
      );
    });

    it('should throw error if start date of a session is in the past', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'COHORT',
          start_date: '2021-11-19T18:30:00.263Z',
          end_date: '2022-11-19T20:30:00.263Z',
          sessions: [
            {
              day_of_week: 1,
              start_time: '2022-11-19T18:30:00.263Z',
              end_time: '2022-11-19T20:30:00.263Z',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Start date should be in the future');
    });

    it('should throw error if end date is before start date', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'COHORT',
          start_date,
          end_date: new Date('2024-11-19T20:30:00.263Z'),
          sessions: [
            {
              day_of_week: 1,
              start_time: '2024-11-19T18:30:00.263Z',
              end_time: '2024-11-19T20:30:00.263Z',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('End date should be after start date');
    });

    it('should throw error if end time is before start time', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'COHORT',
          start_date,
          end_date,
          sessions: [
            {
              day_of_week: 1,
              start_time: '2024-11-19T20:30:00.263Z',
              end_time: '2024-11-19T18:30:00.263Z',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('End time should be after start time');
    });

    it('should throw error if day of week is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'COHORT',
          start_date,
          end_date,
          sessions: [
            {
              day_of_week: 7,
              start_time: '2024-11-19T18:30:00.263Z',
              end_time: '2024-11-19T20:30:00.263Z',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid day of week');
    });

    it('should throw error if start time and end time are same', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'COHORT',
          start_date,
          end_date,
          sessions: [
            {
              day_of_week: 1,
              start_time: '2024-11-19T18:30:00.263Z',
              end_time: '2024-11-19T18:30:00.263Z',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Start time and end time cannot be same',
      );
    });

    it('should create a new schedule for cohort course', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/${testCourse.slug}/schedule`)
        .set(headers)
        .send({
          course_type: 'COHORT',
          start_date,
          end_date,
          sessions: [
            {
              day_of_week: 1,
              start_time: '2024-11-19T20:30:00.263Z',
              end_time: '2024-11-19T22:30:00.263Z',
            },
          ],
        });

      const recurringDetails = await prisma.recurringDetails.findMany({
        where: {
          sessionId: response.body.Session[0].id,
        },
      });

      expect(response.status).toBe(201);
      expect(recurringDetails).toHaveLength(1);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'Test Course',
        slug: 'test-course',
        description: null,
        categoryId: expect.any(Number),
        tags: [],
        tagline: null,
        logo: null,
        level: 'BEGINNER',
        thumbnails: [],
        accessType: 'EVERYONE',
        accessDuration: null,
        enrollmentDeadline: null,
        startAt: start_date.toISOString(),
        endAt: end_date.toISOString(),
        type: 'COHORT',
        isPublished: false,
        Session: [
          {
            id: expect.any(String),
            name: 'Session',
            startAt: '2024-11-19T20:30:00.263Z',
            endAt: '2024-11-19T22:30:00.263Z',
            courseId: testCourse.id,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            description: null,
            duration: 7200000,
          },
        ],
        creatorId: creatorTestUser1.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('/course/:id/enrollment', () => {
    it('should throw error if course does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch('/course/invalid_id/enrollment')
        .set(headers)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual(`Course:invalid_id not found!`);
    });

    it('should throw error if user does not owns the course', async () => {
      const jwtTokens = await generateJwtTokens(
        creatorTestUser2,
        jwtService,
        refreshJwtConfig(),
      );
      const headers = { Authorization: `Bearer ${jwtTokens.access_token}` };

      const response = await request(app.getHttpServer())
        .patch(`/course/${testCourse.slug}/enrollment`)
        .set(headers)
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.message).toEqual(
        `User:${creatorTestUser2.id} does not have the required permission`,
      );
    });

    it('should throw error if deadline is not within course start and end date', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/course/${testCourse.slug}/enrollment`)
        .set(headers)
        .send({
          type: 'EVERYONE',
          deadline: '2023-11-19T18:30:00.263Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Deadline should be within course start and end date',
      );
    });

    it('should throw error if course dates are not set', async () => {
      await prisma.course.update({
        where: {
          id: testCourse.id,
        },
        data: {
          startAt: null,
          endAt: null,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/course/${testCourse.slug}/enrollment`)
        .set(headers)
        .send({
          type: 'EVERYONE',
          deadline: '2024-11-19T18:30:00.263Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Course start date and end date are required',
      );

      await prisma.course.update({
        where: {
          id: testCourse.id,
        },
        data: {
          startAt: '2024-11-19T18:30:00.263Z',
          endAt: '2025-11-19T18:30:00.263Z',
        },
      });
    });

    it('should update enrollment settings', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/course/${testCourse.slug}/enrollment`)
        .set(headers)
        .send({
          type: 'INVITE_ONLY',
          deadline: '2025-11-19T18:30:00.263Z',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: testCourse.id,
        name: 'Test Course',
        slug: 'test-course',
        description: null,
        tagline: null,
        categoryId: expect.any(Number),
        tags: [],
        logo: null,
        thumbnails: [],
        accessType: 'INVITE_ONLY',
        level: 'BEGINNER',
        accessDuration: null,
        enrollmentDeadline: '2025-11-19T18:30:00.263Z',
        endAt: '2025-11-19T18:30:00.263Z',
        startAt: '2024-11-19T18:30:00.263Z',
        type: 'COHORT',
        isPublished: false,
        creatorId: creatorTestUser1.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
