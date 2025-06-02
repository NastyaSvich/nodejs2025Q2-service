import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { parse } from 'yaml';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const swaggerPath = resolve(__dirname, '..', 'doc', 'api.yaml');
  const swaggerFile = await readFile(swaggerPath, 'utf-8');
  SwaggerModule.setup('doc', app, parse(swaggerFile));

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 4000;
  await app.listen(PORT);
  console.log(`App has been started on the port ${PORT}`);
}
bootstrap();
