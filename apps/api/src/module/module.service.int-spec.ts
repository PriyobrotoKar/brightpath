import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ModuleModule } from './module.module';
import { AppModule } from '@/app.module';
import { NestApplication } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Course, PrismaClient, Role, User } from '@brightpath/db';
import { createUser } from '@/common/user';
import { generateJwtTokens } from '@/common/utils';
import refreshJwtConfig from '@/auth/config/refresh-jwt.config';
import { CourseService } from '@/course/course.service';
import { CacheService } from '@/cache/cache.service';

describe('Module Controller Test', () => {
  let app: NestApplication;
  let prisma: PrismaClient;
  let cacheService: CacheService;

  let invalidTestUser: User;
  let validTestUser: User;
  let testCourse: Course;

  let jwtTokens: {
    invalidTestUser: { access_token: string; refresh_token: string };
    validTestUser: { access_token: string; refresh_token: string };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, ModuleModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService).client;
    cacheService = moduleRef.get(CacheService);
    const jwtService = moduleRef.get(JwtService);
    const courseService = moduleRef.get(CourseService);

    await prisma.user.deleteMany();
    [invalidTestUser, validTestUser] = await Promise.all([
      createUser({ email: 'johnDoe@gmail.com' }, prisma),
      createUser({ email: 'janeDoe@gmail.com' }, prisma),
    ]);

    testCourse = await courseService.createCourse(validTestUser, {
      name: 'Test Course',
      category: 'Test Category',
      level: 'BEGINNER',
    });

    jwtTokens = {
      invalidTestUser: await generateJwtTokens(
        {
          id: invalidTestUser.id,
          email: invalidTestUser.email,
          role: Role.CREATOR,
        },
        jwtService,
        refreshJwtConfig(),
      ),
      validTestUser: await generateJwtTokens(
        {
          id: validTestUser.id,
          email: validTestUser.email,
          role: Role.CREATOR,
        },
        jwtService,
        refreshJwtConfig(),
      ),
    };

    await app.init();
  });

  afterAll(async () => {
    await cacheService.onModuleDestroy();
  });

  describe('/module/:courseId', () => {
    beforeAll(async () => {
      await prisma.module.deleteMany();
    });

    it('should throw error if course does not exist', async () => {
      const headers = {
        Authorization: `Bearer ${jwtTokens.invalidTestUser.access_token}`,
      };
      const response = await request(app.getHttpServer())
        .post('/module/invalid_id')
        .set(headers);

      expect(response.status).toBe(404);
    });

    it('should throw error if user does not have the authority over the course', async () => {
      const headers = {
        Authorization: `Bearer ${jwtTokens.invalidTestUser.access_token}`,
      };
      const response = await request(app.getHttpServer())
        .post(`/module/${testCourse.id}`)
        .set(headers);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        `User:${invalidTestUser.id} does not have the required permission`,
      );
    });

    it('should create a module', async () => {
      const headers = {
        Authorization: `Bearer ${jwtTokens.validTestUser.access_token}`,
      };
      const response = await request(app.getHttpServer())
        .post(`/module/${testCourse.id}`)
        .set(headers)
        .send({
          name: 'Test Module',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'Test Module',
        order: 0,
        status: 'DRAFT',
        duration: 0,
        lessonCount: 0,
        courseId: testCourse.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should not get the modules of a course if the user does not have the authority over the course', async () => {
      const headers = {
        Authorization: `Bearer ${jwtTokens.invalidTestUser.access_token}`,
      };

      const response = await request(app.getHttpServer())
        .get(`/module/${testCourse.id}`)
        .set(headers);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        `User:${invalidTestUser.id} does not have the required permission`,
      );
    });

    it('should get the modules of a course', async () => {
      const headers = {
        Authorization: `Bearer ${jwtTokens.validTestUser.access_token}`,
      };

      const response = await request(app.getHttpServer())
        .get(`/module/${testCourse.id}`)
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    //TODO: Add tests for createDocument
    //TODO: Add tests for getLessons
  });
});
