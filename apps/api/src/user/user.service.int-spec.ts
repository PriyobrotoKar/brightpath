import { AppModule } from '@/app.module';
import { CacheService } from '@/cache/cache.service';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import request from 'supertest';
import { createUser, getUserByEmailOrId } from '@/common/user';
import { generateJwtTokens } from '@/common/utils';
import { JwtService } from '@nestjs/jwt';
import { User } from '@brightpath/db';
import refreshJwtConfig from '@/auth/config/refresh-jwt.config';

describe('User Controller Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userService: UserService;
  let cacheService: CacheService;
  let jwtService: JwtService;

  let headers: Record<string, string>;
  let testUser: User;
  let jwtTokens: { access_token: string; refresh_token: string };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userService = moduleRef.get(UserService);
    cacheService = moduleRef.get(CacheService);
    jwtService = moduleRef.get(JwtService);
    await app.init();

    await prisma.user.deleteMany();
    testUser = await createUser({ email: 'johndoe@gmail.com' }, prisma);
    jwtTokens = await generateJwtTokens(
      testUser,
      jwtService,
      refreshJwtConfig(),
    );
    headers = { Authorization: `Bearer ${jwtTokens.access_token}` };
  });

  afterAll(async () => {
    await cacheService.onModuleDestroy();
  });

  describe('/user', () => {
    it('should throw error is user is not logged in', async () => {
      const response = await request(app.getHttpServer()).get('/user');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return user if logged in', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .set(headers);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...testUser,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should update the current user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user')
        .set(headers)
        .send({
          name: 'John Doe',
        });

      const updatedUser = await getUserByEmailOrId(
        testUser.id,
        prisma,
        cacheService,
      );

      expect(response.status).toBe(200);
      expect(updatedUser.name).toBe('John Doe');
      expect(updatedUser.isOnboardingFinished).toBe(true);
    });

    it('should not update the email to an existing email', async () => {
      await createUser({ email: 'janedoe@gmail.com' }, prisma);

      const response = await request(app.getHttpServer())
        .patch('/user')
        .set(headers)
        .send({
          email: 'janedoe@gmail.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should generate an OTP for updating email', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user')
        .set(headers)
        .send({
          email: 'alice@gmail.com',
        });

      const otp = await cacheService.getCachedValue('otp', 'johndoe@gmail.com');

      expect(response.status).toBe(200);
      expect(otp).toBeTruthy();
      expect(otp.length).toBe(6);
    });
  });

  describe('/user/validate-email-change', () => {
    beforeAll(async () => {
      await cacheService.deleteCachedValue('tempEmail', 'johndoe@gmail.com');
    });

    it('should not validate the email change if the otp is blank', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/validate-email-change')
        .set(headers)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid OTP');
    });

    it("should not validate the email change if the otp doesn't match", async () => {
      const response = await request(app.getHttpServer())
        .post('/user/validate-email-change')
        .set(headers)
        .send({
          otp: '123456',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Incorrect OTP');
    });

    it("should throw error if there's no pending email change request", async () => {
      const otp = await cacheService.getCachedValue('otp', 'johndoe@gmail.com');
      const response = await request(app.getHttpServer())
        .post('/user/validate-email-change')
        .set(headers)
        .send({ otp });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'No pending email change request found for this user',
      );
    });

    it('should update the email if otp is valid', async () => {
      const payload = jwtService.decode(jwtTokens.access_token);
      await userService.updateSelf(payload, { email: 'alice@gmail.com' });
      const otp = await cacheService.getCachedValue('otp', 'johndoe@gmail.com');
      const tempEmail = await cacheService.getCachedValue(
        'tempEmail',
        'johndoe@gmail.com',
      );
      const response = await request(app.getHttpServer())
        .post('/user/validate-email-change')
        .set(headers)
        .send({ otp });

      const updatedUser = await getUserByEmailOrId(
        tempEmail,
        prisma,
        cacheService,
      );

      expect(response.status).toBe(200);
      expect(updatedUser).toBeDefined();
    });
  });
});
