import { ApiProperty } from '@nestjs/swagger';
import { CustomInternalServerErrorDto } from 'src/common/dto/custom-internal-server-error.dto';
import { Methods } from 'src/common/enum/methods.enum';

export class MailSendInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Failed to send email' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/email/send' })
  declare endpoint: string;
}

export class MailSendBulkInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Failed to send bulk emails' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/email/send-bulk' })
  declare endpoint: string;
}