/**
 * @fileoverview This file defines a custom NestJS decorator called `ApiErrorResponses` that allows developers to easily apply multiple Swagger error response decorators to their controller methods. The decorator accepts an object mapping error types (such as validation, unauthorized, forbidden, notFound, conflict, internal, throttle) to their corresponding DTOs. If a DTO is not provided for a specific error type, a default custom DTO will be used. This approach helps to keep controller code clean and maintainable by consolidating error response definitions into a single decorator.
 */
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CustomConflictDto } from '../dto/custom-conflict.dto';
import { CustomForbiddenDto } from '../dto/custom-forbidden.dto';
import { CustomInternalServerErrorDto } from '../dto/custom-internal-server-error.dto';
import { CustomNotFoundDto } from '../dto/custom-not-found.dto';
import { CustomUnauthorizedDto } from '../dto/custom-unauthorized.dto';
import { ValidationErrorResponseDto } from '../dto/validation-error.dto';

/**
 * Decorator to apply multiple error response decorators at once. Accepts an object where keys are error types and values are corresponding DTOs. If a DTO is not provided for a specific error type, a default custom DTO will be used.
 * Supported error types: validation, unauthorized, forbidden, notFound, conflict, internal, throttle.
 * Example usage:
 * @ApiErrorResponses({
 *   validation: CustomValidationErrorDto,
 *   unauthorized: CustomUnauthorizedDto,
 *   forbidden: CustomForbiddenDto,
 *   notFound: CustomNotFoundDto,
 *   conflict: CustomConflictDto,
 *   internal: CustomInternalServerErrorDto,
 *   throttle: CustomThrottleDto,
 * })
 */
interface ErrorDtoMap {
  validation?: any;
  unauthorized?: any;
  forbidden?: any;
  notFound?: any;
  conflict?: any;
  internal?: any;
  throttle?: any;
}

/**
 * Custom decorator to apply multiple Swagger error response decorators based on the provided DTO map. This allows for cleaner controller code by consolidating error response definitions into a single decorator.
 *
 * @param dtos An object mapping error types to their corresponding DTOs. If a DTO is not provided for a specific error type, a default custom DTO will be used.
 *
 * Supported error types:
 * - validation: 400 Bad Request
 * - unauthorized: 401 Unauthorized
 * - forbidden: 403 Forbidden
 * - notFound: 404 Not Found
 * - conflict: 409 Conflict
 * - internal: 500 Internal Server Error
 * - throttle: 429 Too Many Requests
 */
export function ApiErrorResponses(dtos: ErrorDtoMap) {
  const decorators: (MethodDecorator & ClassDecorator)[] = [];

  if (dtos.validation)
    decorators.push(
      ApiBadRequestResponse({
        type: dtos.validation || ValidationErrorResponseDto,
      }),
    );
  if (dtos.unauthorized)
    decorators.push(
      ApiUnauthorizedResponse({
        type: dtos.unauthorized || CustomUnauthorizedDto,
      }),
    );
  if (dtos.forbidden)
    decorators.push(
      ApiForbiddenResponse({ type: dtos.forbidden || CustomForbiddenDto }),
    );
  if (dtos.notFound)
    decorators.push(
      ApiNotFoundResponse({ type: dtos.notFound || CustomNotFoundDto }),
    );
  if (dtos.conflict)
    decorators.push(
      ApiConflictResponse({ type: dtos.conflict || CustomConflictDto }),
    );
  if (dtos.internal)
    decorators.push(
      ApiInternalServerErrorResponse({
        type: dtos.internal || CustomInternalServerErrorDto,
      }),
    );
  if (dtos.throttle)
    decorators.push(ApiTooManyRequestsResponse({ type: dtos.throttle }));

  return applyDecorators(...decorators);
}
