/**
 * @fileoverview Swagger DTOs for 201 success responses on the email send endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Methods } from 'src/common/enum/methods.enum';

/** Swagger 201 success response shape for POST /api/test/email/send. */
export class MailSendSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Email sent successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/email/send' })
  declare endpoint: string;

  @ApiProperty({ example: 201 })
  declare statusCode: number;

  @ApiProperty({ example: { queued: 1 } })
  declare data: { queued: number };
}

/** Swagger 201 success response shape for POST /api/test/email/send-bulk. */
export class MailSendBulkSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Bulk emails queued successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/email/send-bulk' })
  declare endpoint: string;

  @ApiProperty({ example: 201 })
  declare statusCode: number;

  @ApiProperty({ example: { queued: 4 } })
  declare data: { queued: number };
}
