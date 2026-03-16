/**
 * @fileoverview Email test controller — exposes POST endpoints for testing single and bulk email sends.
 * All delivery is handled asynchronously by the BullMQ worker; API responses return immediately.
 */
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from 'src/common/email/dto/send-email.dto';
import { EmailService } from 'src/common/email/email.service';
import { ServicePayload } from 'src/shared/interfaces/response.interface';
import { ApiErrorResponses } from '../decorators/api-error-response.decorator';
import { ApiSuccessResponse } from '../decorators/api-success-response.decorator';
import {
  MailSendBulkInternalServerErrorDto,
  MailSendInternalServerErrorDto,
} from './dto/error/mail-send-internal-server-error.dto';
import {
  MailSendBulkValidationDto,
  MailSendValidationDto,
} from './dto/error/mail-send-validation-error.dto';
import {
  MailSendBulkSuccessResponseDto,
  MailSendSuccessResponseDto,
} from './dto/success/mail-send-success.dto';
import { BulkValidationPipe } from '../pipes/bulk-validation.pipe';

/**
 * EmailTestController provides endpoints to test the background email sending functionality.
 * It allows for sending single and bulk emails to verify the integration with BullMQ and Nodemailer.
 */
@ApiTags('Email Test')
@Controller('test/email')
export class EmailTestController {
  constructor(private readonly emailService: EmailService) {}

  /** Enqueue a single email (or fan-out per recipient when `to` is an array). Returns immediately. */
  @ApiOperation({ summary: 'Send a single email in the background' })
  @ApiSuccessResponse(MailSendSuccessResponseDto, 201)
  @ApiErrorResponses({
    validation: MailSendValidationDto,
    internal: MailSendInternalServerErrorDto,
  })
  @Post('send')
  async sendEmail(
    @Body() dto: SendEmailDto,
  ): Promise<ServicePayload<{ queued: number }>> {
    const result = await this.emailService.sendEmail(dto);
    return { message: result.message, data: { queued: result.queued } };
  }

  /** Enqueue multiple independent email messages. Returns immediately. */
  @ApiOperation({ summary: 'Send multiple emails in the background (bulk)' })
  @ApiBody({ type: SendEmailDto, isArray: true })
  @ApiSuccessResponse(MailSendBulkSuccessResponseDto, 201)
  @ApiErrorResponses({
    validation: MailSendBulkValidationDto,
    internal: MailSendBulkInternalServerErrorDto,
  })
  @Post('send-bulk')
  @UsePipes(new BulkValidationPipe())
  async sendBulkEmail(@Body() dto: SendEmailDto[]) {
    const result = await this.emailService.sendBulkEmail(dto);

    return {
      message: result.message,
      data: { queued: result.queued },
    };
  }
}
