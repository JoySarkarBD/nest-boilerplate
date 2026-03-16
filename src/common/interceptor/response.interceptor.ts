/**
 * @fileoverview Global response interceptor for the API Gateway.
 * Wraps all outgoing responses in a standardised ServiceResponse envelope.
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceResponse } from 'src/shared/interfaces/response.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  /**
   * Intercepts outgoing responses and wraps them in a ServiceResponse envelope.
   *
   * @param context - The execution context of the request
   * @param next - The next handler in the request pipeline
   * @returns An Observable of ServiceResponse
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<ServiceResponse> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const method = req.method;
    const url = req.originalUrl || req.url || '';

    // Skip wrapping for root API path
    if (url === '/api' || url === '/api/') {
      return next.handle() as Observable<ServiceResponse>; // rare case — type assertion ok here
    }

    return next.handle().pipe(
      map((data: unknown): ServiceResponse => {
        // Already looks like ServiceResponse
        if (this.isServiceResponse(data)) {
          // Safe: we already checked the shape
          const typed = data;

          // Ensure statusCode is always present
          if (typeof typed.statusCode !== 'number') {
            typed.statusCode = res.statusCode ?? 200;
          }

          return typed;
        }

        // Raw value or partial envelope
        let statusCode = res.statusCode ?? 200;

        // Safely extract statusCode only if it exists and is number
        if (
          data &&
          typeof data === 'object' &&
          data !== null &&
          'statusCode' in data &&
          typeof (data as { statusCode?: unknown }).statusCode === 'number'
        ) {
          statusCode = (data as { statusCode: number }).statusCode;
        }

        // Update Express response status if needed
        if (res.statusCode !== statusCode) {
          res.status(statusCode);
        }

        const { message, payload } = this.extractMessageAndPayload(data);

        return {
          success: statusCode >= 200 && statusCode < 300,
          message,
          method,
          endpoint: url,
          statusCode,
          timestamp: new Date().toISOString(),
          data: payload,
        };
      }),
    );
  }

  /**
   * Type guard: checks if value matches minimal ServiceResponse shape
   */
  private isServiceResponse(value: unknown): value is ServiceResponse {
    return (
      value != null &&
      typeof value === 'object' &&
      'success' in value &&
      'timestamp' in value &&
      'statusCode' in value
    );
  }

  /**
   * Safely extract message & actual payload
   */
  private extractMessageAndPayload(data: unknown): {
    message: string;
    payload: unknown;
  } {
    if (data && typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;

      const hasMessage = 'message' in obj && typeof obj.message === 'string';
      const hasDataProp = 'data' in obj;

      if (hasMessage || hasDataProp) {
        return {
          message: hasMessage ? (obj.message as string) : 'Request successful',
          payload: hasDataProp ? obj.data : data,
        };
      }
    }

    // Default fallback
    return {
      message: 'Request successful',
      payload: data,
    };
  }
}
