import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/common/logging/logging.filter';
import { LoggingInterceptor } from 'src/common/logging/logging.intercepter';
import { LoggingService } from 'src/common/logging/logging.service';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { parse } from 'yaml';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(LoggingService);

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const swaggerPath = resolve(__dirname, '..', 'doc', 'api.yaml');
  const swaggerFile = await readFile(swaggerPath, 'utf-8');
  SwaggerModule.setup('doc', app, parse(swaggerFile));

  const configService = app.get(ConfigService);
  const PORT = configService.get('APP_PORT') || 4000;

  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });

  logger.log(`App has been started on the port ${PORT}`);

  await app.listen(PORT);
}
bootstrap();
