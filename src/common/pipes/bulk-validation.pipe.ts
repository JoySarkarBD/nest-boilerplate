/**
 * @fileoverview BulkValidationPipe — validates an array of `SendEmailDto` items.
 * Throws a structured 400 with per-item `{ index, field, message }` errors.
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

/** Validates each item in a bulk request body against `SendEmailDto`. */
@Injectable()
export class BulkValidationPipe implements PipeTransform {
  /** @throws BadRequestException with `{ index, field, message }` errors if any item is invalid. */
  async transform(value: any, metadata: ArgumentMetadata) {
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
