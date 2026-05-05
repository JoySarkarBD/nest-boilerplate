/**
 * @fileoverview Email module definition.
 *
 * Registers two independent BullMQ queues and their respective workers:
 *
 * | Queue                  | Worker                  | Redis DB                     | Purpose                         |
 * |------------------------|-------------------------|------------------------------|---------------------------------|
 * | `email-queue`          | `EmailProcessor`        | `REDIS_DB_EMAIL_QUEUE`       | General transactional emails    |
 * | `auth-email-queue`     | `AuthEmailProcessor`    | `REDIS_DB_AUTH_EMAIL_QUEUE`  | OTP / security-critical emails  |
 *
 * Import this module in any feature module that needs to send emails.
 * Inject {@link EmailService} and call the appropriate method:
 *  - `sendEmail()`     → general queue
 *  - `sendAuthEmail()` → auth/OTP queue
 *
 * All SMTP transmission happens in background workers — API responses are
 * never blocked by email delivery.
 */
import { Module } from '@nestjs/common';
import { AuthEmailProcessor } from './auth-email-service/auth-email.processor';
import { AuthEmailQueueProvider } from './auth-email-service/auth-email.queue';
import { EmailService } from './email.service';
import { EmailProcessor } from './test-email-service/email.processor';
import { EmailQueueProvider } from './test-email-service/email.queue';

/**
 * Shared email module.
 *
 * Exports {@link EmailService} so that any importing module can enqueue
 * emails without knowing the underlying queue infrastructure.
 */
@Module({
  providers: [
    // ── General email pipeline ────────────────────────────────────────────
    EmailQueueProvider,
    EmailProcessor,

    // ── Auth / OTP email pipeline ─────────────────────────────────────────
    AuthEmailQueueProvider,
    AuthEmailProcessor,

    // ── Shared facade ─────────────────────────────────────────────────────
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
