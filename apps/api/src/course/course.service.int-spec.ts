import { AppModule } from '@/app.module';
import { Test } from '@nestjs/testing';
import { CourseModule } from './course.module';
import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { createUser } from '@/common/user';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@brightpath/db';
import { generateJwtTokens } from '@/common/utils';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from '@/auth/config/refresh-jwt.config';
import { ValidationPipe } from '@nestjs/common';

describe('Course Controller Tests', () => {
  let app: NestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let studentTestUser: User;
  let creatorTestUser: User;
  let headers: Record<string, string>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CourseModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwtService = moduleRef.get(JwtService);

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    await prisma.user.deleteMany();
    [studentTestUser, creatorTestUser] = await Promise.all([
      createUser({ email: 'johndoe@gmail.com', role: 'STUDENT' }, prisma),
      createUser({ email: 'janedoe@gmail.com' }, prisma),
    ]);
    const jwtTokens = await generateJwtTokens(
      creatorTestUser,
      jwtService,
      refreshJwtConfig(),
    );
    headers = { Authorization: `Bearer ${jwtTokens.access_token}` };

    await app.init();
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

    it('should not create a course if name or category is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/course')
        .set(headers)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
        'category must be a string',
      ]);
    });

    it('should create a new course', async () => {
      const response = await request(app.getHttpServer())
        .post('/course')
        .set(headers)
        .send({
          name: 'Test Course',
          category: 'Test Category',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'Test Course',
        description: null,
        categoryId: expect.any(String),
        tags: [],
        banner: null,
        isPublished: false,
        creatorId: creatorTestUser.id,
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
});
