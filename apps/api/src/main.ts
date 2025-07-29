import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { QueryTransformPipe } from './common/pipes/queryTransform.pipe';

export async function createApp() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
    new QueryTransformPipe(),
  );
  app.setGlobalPrefix('api');

  return app;
}

async function bootstrap() {
  const app = await createApp();
  await app.listen(8000);
}
bootstrap();
