import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const rawCors = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
  const allowedOrigins = rawCors
    ? rawCors.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:8081'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
