/**
 * @fileoverview Swagger DTOs for 500 Internal Server Error responses on the email send endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';
import { CustomInternalServerErrorDto } from 'src/common/dto/custom-internal-server-error.dto';
import { Methods } from 'src/common/enum/methods.enum';

/** Swagger 500 response shape for POST /api/test/email/send. */
export class MailSendInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Failed to send email' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/email/send' })
  declare endpoint: string;
}

/** Swagger 500 response shape for POST /api/test/email/send-bulk. */
export class MailSendBulkInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Failed to send bulk emails' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/email/send-bulk' })
  declare endpoint: string;
}
