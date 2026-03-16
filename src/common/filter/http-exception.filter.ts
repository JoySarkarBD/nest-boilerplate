/**
 * @fileoverview Global HTTP exception filter.
 *
 * Catches every thrown exception (including raw validation-error
 * arrays produced by the global ValidationPipe) and normalises
 * them into a predictable JSON response envelope.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Handles any thrown exception and writes a standardised JSON
   * response to the client.
   *
   * @param exception - The caught error (HttpException, validation array, or unknown).
   * @param host - Nest argument host for accessing the HTTP layer.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: { field: string; message: string }[] | undefined;
    let error: string | undefined;

    /* Validation-pipe errors arrive as a raw array */
    if (Array.isArray(exception)) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errors = (exception as Record<string, any>[]).flatMap((err) => {
        const field: string = (err.property as string) || 'unknown';
        const constraints: string[] = err.constraints
          ? Object.values(err.constraints as Record<string, string>)
          : ['Invalid value'];
        return constraints.map((msg) => ({ field, message: msg }));
      });
    } else if (exception instanceof HttpException) {
      const body = exception.getResponse();
      let isRouteNotFound = false;

      if (typeof body === 'string') {
        message = body;
        error = body;
        isRouteNotFound = body.startsWith('Cannot ');
      } else if (body && typeof body === 'object') {
        const obj = body as Record<string, unknown>;
        message = (obj.message as string) || message;
        error = obj.error as string | undefined;
        errors =
          (obj.errors as { field: string; message: string }[] | undefined) ||
          errors; // Extract errors if present in body
        isRouteNotFound =
          typeof obj.message === 'string' && obj.message.startsWith('Cannot ');
      }

      if (status === (HttpStatus.NOT_FOUND as number) && isRouteNotFound) {
        message = 'Path not found';
        error = 'Path not found';
      }
    }

    const payload = {
      success: false,
      message,
      method: request?.method,
      endpoint: request?.originalUrl || request?.url || '',
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...(errors && { errors }),
      ...(error && !errors && { error }),
    };

    response.status(status).json(payload);
  }
}
