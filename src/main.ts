/**
 * @fileoverview API Gateway bootstrap module.
 *
 * Entry point of the NestJS application using Fastify adapter.
 * Responsibilities:
 * - Initialize Nest application with Fastify (high-performance HTTP server)
 * - Configure structured logging (Pino via Fastify logger)
 * - Apply global route prefix with exclusions (e.g., /health)
 * - Register core Fastify plugins (security headers, multipart handling)
 * - Enforce request validation and transformation via global pipes
 * - Attach global interceptors and exception filters for consistent responses
 * - Generate and expose OpenAPI (Swagger) documentation
 * - Start the HTTP server on configured host and port
 */
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestContext } from './common/context/request-context';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { I18nValidationPipe } from './common/pipes/i18n-validation.pipe';
import config from './shared/config/app.config';

/**
 * Bootstraps and starts the API Gateway.
 *
 * Key behaviors:
 * - Enables environment-aware logging (pretty logs in dev, structured in prod)
 * - Applies `/api` global prefix while excluding health check route
 * - Registers Fastify plugins for security and file handling
 * - Sets up global validation, interceptors, and error handling
 * - Exposes Swagger UI and raw JSON spec
 *
 * @returns Promise<void>
 */
async function bootstrap() {
  const isDev = config.NODE_ENV !== 'production';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: isDev
        ? {
            level: 'debug',
            transport: {
              target: 'pino-pretty', // human-readable logs for local development
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            },
          }
        : {
            level: 'info', // structured JSON logs for production
          },
    }),
  );

  /**
   * Apply global route prefix.
   *
   * All routes are prefixed with `/api` except explicitly excluded ones.
   * Health endpoint is excluded to support load balancers and uptime checks.
   */
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  /**
   * Register Fastify security plugin.
   *
   * Adds HTTP headers (CSP, HSTS, XSS protection, etc.)
   * to mitigate common web vulnerabilities.
   */
  await app.register(helmet as any);

  /**
   * Register multipart plugin.
   *
   * Enables handling of file uploads (multipart/form-data).
   */
  await app.register(multipart as any);

  /**
   * Request context middleware.
   *
   * Binds the active Fastify request to AsyncLocalStorage so that
   * {@link I18nValidationPipe} can resolve the `lang` header without
   * needing the request injected explicitly.
   */
  app.use(RequestContext.middleware());

  /**
   * i18n-aware global validation pipe.
   *
   * Runs class-validator on every incoming DTO and translates field-level
   * constraint messages into the locale from the `lang` request header.
   * The top-level 'Validation failed' label is also localised.
   * Supported locales: en (default), bn.
   * Add new locales in src/common/i18n/locales/.
   */
  app.useGlobalPipes(new I18nValidationPipe());

  /**
   * Global interceptor.
   *
   * Standardizes API responses (format, metadata, wrapping).
   */
  app.useGlobalInterceptors(new ResponseInterceptor());

  /**
   * Global exception filter.
   *
   * Centralized error handling and consistent error response formatting.
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  /**
   * Swagger (OpenAPI) configuration.
   *
   * Defines API metadata and authentication scheme.
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Gateway documentation')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'Authorization',
    )
    .setVersion('1.0')
    .build();

  /**
   * Generate OpenAPI document from application routes.
   */
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  /**
   * Serve Swagger UI.
   *
   * Accessible at `/api-doc`
   */
  SwaggerModule.setup('api-doc', app, document);

  /**
   * Serve raw OpenAPI JSON.
   *
   * Useful for API clients, code generation, or external tools.
   */
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.send(document);
  });

  const port = Number(config.PORT ?? 3000);

  /**
   * Start HTTP server.
   *
   * Binds to 0.0.0.0 to allow external access (Docker, cloud, etc.).
   */
  await app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API Gateway is running at http://localhost:${port}/api`);
    console.log(`📖 Swagger UI available at http://localhost:${port}/api-doc`);
  });
}

// Execute bootstrap
void bootstrap();
