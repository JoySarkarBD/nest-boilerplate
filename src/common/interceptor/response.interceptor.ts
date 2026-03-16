/**
 * @fileoverview Global response interceptor for the NestJS application.
 * Intercepts all outgoing responses to ensure they conform to a standardized
 * ServiceResponse envelope format, providing consistency across all API endpoints.
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

/**
 * ResponseInterceptor wraps outgoing data in a standardized JSON response format.
 * It manages common response fields like success status, message, method, and endpoint.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  /**
   * Intercepts outgoing responses and wraps them in a ServiceResponse envelope.
   *
   * @param context - The execution context of the request, providing access to request and response objects.
   * @param next - The next handler in the request pipeline to trigger the response emission.
   * @returns An Observable that emits the transformed ServiceResponse.
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
   * Type guard to check if a value matches the minimal ServiceResponse shape.
   *
   * @param value - The value to check for compatibility with ServiceResponse.
   * @returns True if the value matches the ServiceResponse structure, false otherwise.
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
   * Safely extracts a message and the actual payload from the response data.
   *
   * @param data - The raw response data emitted by the controller.
   * @returns An object containing the extracted message and payload.
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
