/**
 * @fileoverview SMS service — queue facade for auth SMS (OTP) delivery.
 *
 * Callers inject {@link SmsService} and call {@link sendAuthSms} to enqueue
 * an OTP SMS onto the dedicated `auth-sms` BullMQ queue.  The actual HTTP
 * call to sms.net.bd is performed asynchronously by {@link AuthSmsProcessor}.
 *
 * This design ensures the registration/forgot-password request path is never
 * blocked by SMS gateway latency or transient network errors.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  AUTH_SMS_JOB,
  AUTH_SMS_MAX_ATTEMPTS,
  AUTH_SMS_QUEUE,
} from './constants/sms.constants';
import { SmsJobData } from './interfaces/sms.interface';

/** BullMQ job options for every auth-SMS job. */
const AUTH_SMS_JOB_OPTIONS = {
  attempts: AUTH_SMS_MAX_ATTEMPTS,
  backoff: { type: 'exponential' as const, delay: 2_000 },
  removeOnComplete: true,
  removeOnFail: false, // retain for ops investigation
} as const;

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @Inject(AUTH_SMS_QUEUE)
    private readonly authSmsQueue: Queue<SmsJobData>,
  ) {}

  /**
   * Enqueue a single auth SMS (OTP) for asynchronous delivery.
   *
   * The phone number **must** already be normalised to E.164 (`+8801XXXXXXXXX`)
   * by the caller — normalisation is a domain concern, not an infrastructure one.
   *
   * @param toNormalised - Recipient in E.164 format.
   * @param message      - Plain-text OTP message body.
   */
  async sendAuthSms(toNormalised: string, message: string): Promise<void> {
    await this.authSmsQueue.add(
      AUTH_SMS_JOB,
      { to: toNormalised, message },
      AUTH_SMS_JOB_OPTIONS,
    );

    this.logger.log(`Queued auth SMS job → to: ${toNormalised}`);
  }
}
