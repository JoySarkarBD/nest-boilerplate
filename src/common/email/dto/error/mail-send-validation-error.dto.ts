/**
 * @fileoverview Swagger DTOs for 400 validation error responses on the email send endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  FieldErrorDto,
  ValidationErrorResponseDto,
} from 'src/common/dto/validation-error.dto';
import { Methods } from 'src/common/enum/methods.enum';

/** Swagger 400 validation error shape for POST /api/test/email/send. */
export class MailSendValidationDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/email/send' })
  declare endpoint: string;

  @ApiProperty({ example: 400 })
  declare statusCode: number;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [
      {
        field: 'to',
        message: 'to is required - can be string or array of strings',
      },
      { field: 'subject', message: 'subject must be a string' },
    ],
  })
  declare errors: FieldErrorDto[];
}

/** Single field-level error for a bulk email item, includes the array index. */
export class BulkFieldErrorDto {
  /** Index of the item in the bulk array that failed. */
  @ApiProperty({ example: 0 })
  index!: number;

  /** The invalid field name. */
  @ApiProperty({ example: 'to' })
  field!: string;

  /** Validation failure message. */
  @ApiProperty({ example: 'Invalid email format' })
  message!: string;
}

/** Swagger 400 validation error shape for POST /api/test/email/send-bulk. */
export class MailSendBulkValidationDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/email/send-bulk' })
  declare endpoint: string;

  @ApiProperty({ example: 400 })
  declare statusCode: number;

  @ApiProperty({
    type: [BulkFieldErrorDto],
    example: [
      { index: 0, field: 'to', message: 'Invalid email format' },
      { index: 1, field: 'subject', message: 'subject must be a string' },
      { index: 2, field: 'html', message: 'html must be a string' },
      { index: 3, field: 'text', message: 'text must be a string' },
    ],
  })
  declare errors: BulkFieldErrorDto[];
}
