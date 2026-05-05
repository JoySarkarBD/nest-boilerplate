/**
 * @fileoverview Auth SMS processor worker.
 *
 * Consumes jobs from the {@link AUTH_SMS_QUEUE} BullMQ queue and delivers them
 * via the {@link SmsGatewayClient} (sms.net.bd HTTP API).
 *
 * Design mirrors {@link AuthEmailProcessor} for consistency:
 *  - Worker created in {@link onModuleInit}, torn down in {@link onModuleDestroy}.
 *  - Concurrency set to `2` — SMS gateway has lower rate limits than SMTP.
 *  - Exponential back-off on failure, up to {@link AUTH_SMS_MAX_ATTEMPTS}.
 *  - All retries and permanent failures are logged with full job context for
 *    ops investigation.
 */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { RedisClientService } from 'src/common/redis/redis.client';
import {
  AUTH_SMS_JOB,
  AUTH_SMS_MAX_ATTEMPTS,
  AUTH_SMS_QUEUE,
} from '../constants/sms.constants';
import { SmsJobData } from '../interfaces/sms.interface';
import { SmsGatewayClient } from '../sms-gateway.client';

@Injectable()
export class AuthSmsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuthSmsProcessor.name);

  /** BullMQ worker instance — initialised in {@link onModuleInit}. */
  private worker!: Worker<SmsJobData>;

  constructor(
    private readonly redisClientService: RedisClientService,
    private readonly smsGatewayClient: SmsGatewayClient,
  ) {}

  /**
   * Starts the BullMQ worker and attaches observability event listeners.
   *
   * Concurrency is `2` — conservative to respect SMS gateway rate limits
   * while still allowing parallel delivery during registration bursts.
   */
  onModuleInit(): void {
    this.worker = new Worker<SmsJobData>(
      AUTH_SMS_QUEUE,
      async (job: Job<SmsJobData>) => {
        if (job.name !== AUTH_SMS_JOB) return;

        this.logger.debug(
          `[Auth SMS] Processing job #${job.id} → to: ${job.data.to}`,
        );

        const result = await this.smsGatewayClient.sendText(
          job.data.to,
          job.data.message,
        );

        if (!result.success) {
          // Throw so BullMQ triggers the retry policy
          throw new Error(result.error ?? 'SMS gateway returned failure');
        }

        this.logger.log(`✅ [Auth SMS] Delivered → ${job.data.to}`);
      },
      {
        connection: this.redisClientService.getClientAuthSmsQueueOptions(),
        concurrency: 2,
      },
    );

    // ── Retry / failure logging ────────────────────────────────────────────
    this.worker.on('failed', (job: Job<SmsJobData> | undefined, err: Error) => {
      if (!job) return;

      const remaining = AUTH_SMS_MAX_ATTEMPTS - job.attemptsMade;

      if (job.attemptsMade < AUTH_SMS_MAX_ATTEMPTS) {
        this.logger.warn(
          `⚠️  [Auth SMS] Job #${job.id} failed ` +
            `(attempt ${job.attemptsMade}/${AUTH_SMS_MAX_ATTEMPTS}). ` +
            `Retrying ${remaining} more time(s). Error: ${err.message}`,
        );
        return;
      }

      this.logger.error(
        `❌ [Auth SMS] SMS permanently failed after ${AUTH_SMS_MAX_ATTEMPTS} attempts.\n` +
          `   Job ID : ${job.id}\n` +
          `   To     : ${job.data.to}\n` +
          `   Error  : ${err.message}\n` +
          `   Stack  : ${err.stack ?? 'n/a'}`,
      );
    });

    this.worker.on('completed', (job: Job<SmsJobData>) => {
      this.logger.debug(`[Auth SMS] Job #${job.id} completed.`);
    });

    this.logger.log('Auth SMS worker started.');
  }

  /**
   * Gracefully closes the BullMQ worker on module teardown.
   * In-flight jobs are drained before the process exits — no OTP is silently lost.
   */
  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    this.logger.log('Auth SMS worker shut down.');
  }
}
