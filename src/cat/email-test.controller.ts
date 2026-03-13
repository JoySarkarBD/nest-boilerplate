import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from 'src/common/email/dto/send-email.dto';
import { EmailService } from 'src/common/email/email.service';
import { ServicePayload } from 'src/shared/interfaces/response.interface';

@ApiTags('Email Test')
@Controller('test/email')
export class EmailTestController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Send a single email (or fan out to multiple recipients via the `to` array).
   * The HTTP response is returned immediately — delivery happens in the background.
   */
  @ApiOperation({ summary: 'Send a single email in the background' })
  @Post('send')
  async sendEmail(
    @Body() dto: SendEmailDto,
  ): Promise<ServicePayload<{ queued: number }>> {
    const result = await this.emailService.sendEmail(dto);
    return { message: result.message, data: { queued: result.queued } };
  }

  /**
   * Send multiple independent email messages at once.
   * The HTTP response is returned immediately — all deliveries happen in the background.
   */
  @ApiOperation({ summary: 'Send multiple emails in the background (bulk)' })
  @ApiBody({ type: SendEmailDto, isArray: true })
  @Post('send-bulk')
  async sendBulkEmail(
    @Body() dto: SendEmailDto[],
  ): Promise<ServicePayload<{ queued: number }>> {
    const result = await this.emailService.sendBulkEmail(dto);
    return { message: result.message, data: { queued: result.queued } };
  }
}
