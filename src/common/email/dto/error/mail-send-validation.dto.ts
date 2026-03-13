import { ApiProperty } from '@nestjs/swagger';
import {
  FieldErrorDto,
  ValidationErrorResponseDto,
} from 'src/common/dto/validation-error.dto';
import { Methods } from 'src/common/enum/methods.enum';

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
      { field: 'subject', message: 'subject is required' },
      { field: 'html', message: 'html is required' },
      { field: 'text', message: 'text is required' },
    ],
  })
  declare errors: FieldErrorDto[];
}

export class BulkFieldErrorDto {
  @ApiProperty({ example: 0 })
  index: number;

  @ApiProperty({ example: 'to' })
  field: string;

  @ApiProperty({ example: 'Invalid email format' })
  message: string;
}

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
      {
        index: 0,
        field: 'to',
        message: 'Invalid email format',
      },
      {
        index: 1,
        field: 'subject',
        message: 'subject must be a string',
      },
      {
        index: 2,
        field: 'html',
        message: 'html must be a string',
      },
      {
        index: 3,
        field: 'text',
        message: 'text must be a string',
      },
    ],
  })
  declare errors: BulkFieldErrorDto[];
}
