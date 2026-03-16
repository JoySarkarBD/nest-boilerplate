/**
 * @fileoverview BulkValidationPipe — validates an array of `SendEmailDto` items.
 * Throws a structured 400 with per-item `{ index, field, message }` errors.
 * This pipe ensures that bulk operations receive valid data for each entry.
 */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SendEmailDto } from 'src/common/email/dto/send-email.dto';

/**
 * BulkValidationPipe handles the validation of an array of objects against a specific DTO.
 * It is specifically designed for bulk email operations, ensuring each item in the array
 * adheres to the SendEmailDto validation rules.
 */
@Injectable()
export class BulkValidationPipe implements PipeTransform {
  /**
   * Transforms and validates the input value.
   *
   * @param value - The raw input value, expected to be an array of email payloads.
   * @param _metadata - Metadata about the currently processed argument.
   * @returns The validated array if all items pass validation.
   * @throws BadRequestException if the input is not an array, is empty, or contains invalid items.
   */
  async transform(
    value: unknown,
    _metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (!Array.isArray(value)) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: [
          {
            field: 'body',
            message: 'Request body must be an array',
          },
        ],
      });
    }

    if (value.length === 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: [
          {
            field: 'body',
            message: 'Request body must contain at least one email payload',
          },
        ],
      });
    }

    const errors: { index: number; field: string; message: string }[] = [];

    for (let i = 0; i < value.length; i++) {
      const dto = plainToInstance(SendEmailDto, value[i]);

      const validationErrors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      for (const err of validationErrors) {
        const constraints = Object.values(err.constraints || {});
        for (const msg of constraints) {
          errors.push({
            index: i,
            field: err.property,
            message: msg,
          });
        }
      }
    }

    if (errors.length) {
      throw new BadRequestException({
        message: 'Bulk validation failed',
        errors,
      });
    }

    return value;
  }
}
