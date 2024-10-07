import request from 'supertest';
import { AppModule } from '@/app.module';
import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthService } from './auth.service';
import { CacheService } from '@/cache/cache.service';
import { OTP_EXPIRY } from '@/common/constants';

describe('Auth Controller Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let cacheService: CacheService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
    cacheService = moduleRef.get(CacheService);
    await app.init();
  });

  afterAll(async () => {
    await cacheService.onModuleDestroy();
  });

  describe('/send-otp', () => {
    afterEach(async () => {
      await prisma.user.deleteMany();
    });

    it('should not send the otp if the email is blank', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email');
    });

    it('should not send the otp if the email is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ email: 'testemail' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email');
    });

    it('should send the otp if the email is valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ email: 'johndoe@gmail.com' });

      expect(response.status).toBe(201);
      expect(response.text).toBe('OTP has been sent to johndoe@gmail.com');
    });

    it('should generate an otp', async () => {
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ email: 'johndoe@gmail.com' });

      const otp = await cacheService.getCachedValue('otp', 'johndoe@gmail.com');
      const expiry = await cacheService.getExpiry('otp', 'johndoe@gmail.com');

      expect(otp).toBeDefined();
      expect(expiry).toBe(OTP_EXPIRY);
      expect(otp.length).toBe(6);
    });

    it('should replace the otp if regenerated', async () => {
      await authService.sendOtp('johndoe@gmail.com');

      const otp = await cacheService.getCachedValue('otp', 'johndoe@gmail.com');
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ email: 'johndoe@gmail.com' });

      const newOtp = await cacheService.getCachedValue(
        'otp',
        'johndoe@gmail.com',
      );
      const expiry = await cacheService.getExpiry('otp', 'johndoe@gmail.com');

      expect(newOtp).toBeDefined();
      expect(expiry).toBe(OTP_EXPIRY);
      expect(newOtp.length).toBe(6);
      expect(newOtp).not.toBe(otp);
    });

    it('should create a new user if does not exist', async () => {
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ email: 'johndoe@gmail.com' });

      const user = await prisma.user.findUnique({
        where: {
          email: 'johndoe@gmail.com',
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('johndoe@gmail.com');
    });

    it('should not create user if already exists', async () => {
      await authService.sendOtp('johndoe@gmail.com');

      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ email: 'johndoe@gmail.com' });

      const user = await prisma.user.findMany({
        where: {
          email: 'johndoe@gmail.com',
        },
      });

      expect(user).toHaveLength(1);
    });
  });

  describe('/verify-otp', () => {
    it('should not verify the otp if the email is blank or invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email');
    });

    it('should not verify the otp if the otp is blank', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ email: 'johndoe@gmail.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid OTP');
    });

    it('should not verify the otp if the otp is wrong', async () => {
      await authService.sendOtp('johndoe@gmail.com');

      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ email: 'johndoe@gmail.com', otp: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Incorrect OTP');
    });

    it('should verify the otp if the otp is valid', async () => {
      await authService.sendOtp('johndoe@gmail.com');
      const otp = await cacheService.getCachedValue('otp', 'johndoe@gmail.com');

      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ email: 'johndoe@gmail.com', otp });

      const user = await prisma.user.findUnique({
        where: {
          email: 'johndoe@gmail.com',
        },
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...user,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
