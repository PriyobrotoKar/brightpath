import request from 'supertest';
import { AppModule } from '@/app.module';
import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('Auth Controller Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
    await app.init();
  });

  afterEach(() => {
    prisma.user.deleteMany();
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
    await authService.sendOtp('johndoe@gmail.com');

    const otp = await prisma.otp.findFirst({
      where: {
        user: {
          email: 'johndoe@gmail.com',
        },
      },
    });
    await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ email: 'johndoe@gmail.com' });

    const newOtp = await prisma.otp.findFirst({
      where: {
        user: {
          email: 'johndoe@gmail.com',
        },
      },
    });

    expect(newOtp).toBeDefined();
    expect(newOtp.code).toBeDefined();
    expect(newOtp.expiresAt).toBeDefined();
    expect(newOtp.code.length).toBe(6);
    expect(newOtp.code).not.toBe(otp.code);
  });

  it('should replace the otp if regenerated', async () => {
    await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ email: 'johndoe@gmail.com' });

    const otp = await prisma.otp.findFirst({
      where: {
        user: {
          email: 'johndoe@gmail.com',
        },
      },
    });

    expect(otp).toBeDefined();
    expect(otp.code).toBeDefined();
    expect(otp.expiresAt).toBeDefined();
    expect(otp.code.length).toBe(6);
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
