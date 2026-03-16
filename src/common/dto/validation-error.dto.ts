/**
 * @fileoverview Swagger DTOs for 400 Validation Error responses.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Methods } from '../enum/methods.enum';

/**
 * Represents a single field-level validation failure.
 * It contains the name of the invalid field and a descriptive error message.
 */
export class FieldErrorDto {
  @ApiProperty({ example: 'name' })
  field!: string;

  @ApiProperty({ example: 'name must be a string' })
  message!: string;
}

/**
 * Represents a 400 Bad Request response specifically for validation failures.
 * This DTO includes an array of `FieldErrorDto` to pinpoint multiple validation issues.
 */
export class ValidationErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiProperty({ example: Methods.POST })
  method!: Methods;

  @ApiProperty({ example: '/' })
  endpoint!: string;

  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: '2026-02-22T10:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ type: [FieldErrorDto] })
  errors!: FieldErrorDto[];
}
