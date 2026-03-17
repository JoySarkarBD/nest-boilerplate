/**
 * @fileoverview Email service handling the enqueuing of email jobs to the BullMQ queue.
 * This service allows for both single and bulk email operations, delegating the
 * actual transmission to background workers.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  EMAIL_JOB,
  EMAIL_MAX_ATTEMPTS,
  EMAIL_QUEUE,
} from './constants/email.constants';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailJobData } from './interfaces/email.interface';

/** Job options applied to every enqueued email. */
const JOB_OPTIONS = {
  attempts: EMAIL_MAX_ATTEMPTS,
  backoff: {
    type: 'exponential' as const,
    delay: 3_000,
  },
  removeOnComplete: true,
  removeOnFail: false, // keep failed jobs visible in BullMQ dashboard
};

/**
 * EmailService provides methods to enqueue email jobs for background processing.
 * It integrates with BullMQ to handle retries and background task execution.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Initializes the EmailService with a reference to the email queue.
   *
   * @param emailQueue - The BullMQ queue instance used for enqueuing jobs.
   */
  constructor(
    @Inject(EMAIL_QUEUE)
    private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  /**
   * Enqueues a single email (or fans out one job per recipient if `to` is an array).
   * The method returns immediately while the actual transmission happens asynchronously.
   *
   * @param dto - Data Transfer Object containing email details (recipients, subject, content).
   * @returns A promise resolving to the number of jobs queued and a success message.
   */
  async sendEmail(
    dto: SendEmailDto,
  ): Promise<{ queued: number; message: string }> {
    const recipients = Array.isArray(dto.to) ? dto.to : [dto.to];

    await Promise.all(
      recipients.map((email) =>
        this.emailQueue.add(
          EMAIL_JOB,
          { to: email, subject: dto.subject, html: dto.html, text: dto.text },
          JOB_OPTIONS,
        ),
      ),
    );

    this.logger.log(
      `Queued ${recipients.length} email job(s) → subject: "${dto.subject}"`,
    );

    return {
      queued: recipients.length,
      message: 'Email(s) queued successfully',
    };
  }

  /**
   * Enqueues multiple independent email messages at once.
   * Each DTO can target a single address or an array of addresses.
   *
   * @param dtos - An array of SendEmailDto objects.
   * @returns A promise resolving to the total number of jobs queued and a success message.
   */
  async sendBulkEmail(
    dtos: SendEmailDto[],
  ): Promise<{ queued: number; message: string }> {
    let total = 0;

    await Promise.all(
      dtos.map(async (dto) => {
        const result = await this.sendEmail(dto);
        total += result.queued;
      }),
    );

    this.logger.log(`Bulk send complete — total jobs queued: ${total}`);

    return { queued: total, message: 'Bulk emails queued successfully' };
  }
}
