import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(prefix);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173'),
    credentials: true,
  });
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  return port;
}

bootstrap().then((port) => {
  console.log(`Application is running on: http://localhost:${port}/${process.env.API_PREFIX || 'api/v1'}`);
});
