import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { SendEmailDto } from './dto/send-email.dto';
import {
  EMAIL_QUEUE,
  EMAIL_JOB,
  EMAIL_MAX_ATTEMPTS,
} from './constants/email.constants';
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

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EMAIL_QUEUE)
    private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  /**
   * Enqueue a single email (or fan out one job per recipient if `to` is an array).
   * Returns immediately — the actual send happens in the background worker.
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
   * Enqueue multiple independent email messages at once.
   * Each DTO can target a single address or an array of addresses.
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
