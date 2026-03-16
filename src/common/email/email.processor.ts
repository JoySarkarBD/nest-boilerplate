/**
 * @fileoverview Email processor worker.
 * This file contains the BullMQ worker logic that consumes email jobs from the queue
 * and sends them using Nodemailer.
 */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import * as nodemailer from 'nodemailer';
import config from 'src/shared/config/app.config';
import { RedisClientService } from '../redis/redis.client';
import {
  EMAIL_JOB,
  EMAIL_MAX_ATTEMPTS,
  EMAIL_QUEUE,
} from './constants/email.constants';
import { EmailJobData } from './interfaces/email.interface';

/**
 * EmailProcessor is a background worker that handles the actual delivery of emails.
 * It listens to the email queue and processes jobs asynchronously.
 */
@Injectable()
export class EmailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);
  private worker!: Worker<EmailJobData>;

  /**
   * Nodemailer transporter — reads SMTP settings from the centralised config
   * (never from process.env directly).
   */
  private readonly transporter = nodemailer.createTransport({
    host: config.MAIL_HOST,
    port: config.MAIL_PORT,
    auth: {
      user: config.MAIL_USER,
      pass: config.MAIL_PASS,
    },
  });

  constructor(private readonly redisClientService: RedisClientService) {}

  /**
   * Initializes the BullMQ worker and sets up event listeners for job failures and completions.
   */
  onModuleInit(): void {
    this.worker = new Worker<EmailJobData>(
      EMAIL_QUEUE,
      async (job: Job<EmailJobData>) => {
        if (job.name !== EMAIL_JOB) return;

        console.log(job.data);

        this.logger.debug(`Processing job #${job.id} → to: ${job.data.to}`);

        await this.transporter.sendMail({
          from: `"${config.MAIL_FROM_NAME}" <${config.MAIL_FROM_EMAIL}>`,
          to: job.data.to,
          subject: job.data.subject,
          html: job.data.html,
          text: job.data.text,
        });

        this.logger.log(
          `✅ Email sent → ${job.data.to} | subject: "${job.data.subject}"`,
        );
      },
      {
        connection: this.redisClientService.getClientEmailQueueOptions(),
        concurrency: 5,
      },
    );

    // ── Retry progress ──────────────────────────────────────────────────────
    this.worker.on(
      'failed',
      (job: Job<EmailJobData> | undefined, err: Error) => {
        if (!job) return;

        const remaining = EMAIL_MAX_ATTEMPTS - job.attemptsMade;

        if (job.attemptsMade < EMAIL_MAX_ATTEMPTS) {
          this.logger.warn(
            `⚠️  Job #${job.id} failed (attempt ${job.attemptsMade}/${EMAIL_MAX_ATTEMPTS}). ` +
              `Retrying ${remaining} more time(s). Error: ${err.message}`,
          );
          return;
        }

        // All attempts exhausted — log the full details for ops investigation
        this.logger.error(
          `❌ Email permanently failed after ${EMAIL_MAX_ATTEMPTS} attempts.\n` +
            `   Job ID  : ${job.id}\n` +
            `   To      : ${job.data.to}\n` +
            `   Subject : ${job.data.subject}\n` +
            `   Error   : ${err.message}\n` +
            `   Stack   : ${err.stack ?? 'n/a'}`,
        );
      },
    );

    // ── Completion ──────────────────────────────────────────────────────────
    this.worker.on('completed', (job: Job<Job<EmailJobData>['data']>) => {
      this.logger.debug(`Job #${job.id} completed.`);
    });

    this.logger.log('Email worker started.');
  }

  /**
   * Closes the BullMQ worker when the module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    this.logger.log('Email worker shut down.');
  }
}
