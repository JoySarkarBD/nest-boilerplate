/**
 * @fileoverview Global HTTP exception filter.
 *
 * Catches every exception thrown within the application context and formats it
 * into the standard error envelope:
 * ```json
 * {
 *   "success": false,
 *   "message": "<localised>",
 *   "method": "POST",
 *   "endpoint": "/api/auth/register",
 *   "statusCode": 400,
 *   "timestamp": "...",
 *   "errors": [{ "field": "...", "message": "<localised>" }]
 * }
 * ```
 *
 * i18n:
 *  - Business exceptions (from AuthService, etc.) carry a pre-localised
 *    message — passed through unchanged.
 *  - Validation errors are fully localised by {@link I18nValidationPipe}
 *    before they reach this filter — also passed through unchanged.
 *  - Infrastructure messages (path not found, internal server error) are
 *    localised here via the `lang` request header.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { getSystemMessages, resolveLangFromRequest } from '../i18n';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const lang = resolveLangFromRequest(request);
    const m = getSystemMessages(lang);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = m.INTERNAL_SERVER_ERROR;
    let errors: { field: string; message: string }[] | undefined;
    let error: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        // Route-not-found produces "Cannot GET /path"
        message = body.startsWith('Cannot ') ? m.PATH_NOT_FOUND : body;
        error = message;
      } else if (body && typeof body === 'object') {
        const obj = body as Record<string, unknown>;

        const rawMsg = obj.message as string | undefined;
        const isRouteNotFound =
          typeof rawMsg === 'string' && rawMsg.startsWith('Cannot ');

        message = isRouteNotFound
          ? m.PATH_NOT_FOUND
          : (rawMsg ?? m.INTERNAL_SERVER_ERROR);

        error = obj.error as string | undefined;
        errors = obj.errors as { field: string; message: string }[] | undefined;
      }

      // Double-check for Nest's 404 on unknown routes
      if (status === HttpStatus.NOT_FOUND && !errors) {
        message = m.PATH_NOT_FOUND;
        error = m.PATH_NOT_FOUND;
      }
    }

    void response.code(status).send({
      success: false,
      message,
      method: request?.method,
      endpoint: request?.url ?? '',
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...(errors && { errors }),
      ...(error && !errors && { error }),
    });
  }
}
