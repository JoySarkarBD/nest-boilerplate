/**
 * @fileoverview API Gateway bootstrap module.
 *
 * This is the entry point of the NestJS application. It initializes the NestFactory,
 * configures global middleware (Helmet for security, Morgan for logging), sets up
 * global pipes for validation, and registers global interceptors and filters.
 * It also handles the Swagger documentation setup and starts the HTTP server.
 */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import config from './shared/config/app.config';

/**
 * Initializes and starts the NestJS application.
 *
 * @returns A promise that resolves when the application has successfully started.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global route prefix to "api"
  app.setGlobalPrefix('api');

  // Apply security headers
  app.use(helmet());

  // Enable HTTP request logging
  app.use(morgan('dev'));

  // Register global validation pipe with strict options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => errors,
    }),
  );

  // Register global response interceptor and HTTP exception filter
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Register global HTTP exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'Authorization', // <- name important
    )
    .setVersion('1.0')
    .build();

  // Create document
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Serve Swagger UI at /api
  SwaggerModule.setup('api-doc', app, document);

  // Optional: serve raw JSON at /api-json
  app.getHttpAdapter().get('/api-json', (_req: Request, res: Response) => {
    res.json(document); // use send, not json (sometimes works better for $ref parser)
  });

  const port = Number(config.PORT ?? 3000);
  await app.listen(port, () => {
    console.log(`🚀 API Gateway is running at http://localhost:${port}/api`);
    console.log(`📖 Swagger UI available at http://localhost:${port}/api-doc`);
  });
}

// Execute the bootstrap process
void bootstrap();
