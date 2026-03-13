import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailQueueProvider } from './email.queue';
import { EmailProcessor } from './email.processor';

/**
 * Common email module.
 *
 * Import this module in any feature module that needs to send emails.
 * Inject `EmailService` to enqueue single or bulk email jobs.
 *
 * All sending happens in the background worker — API responses are
 * never delayed by SMTP calls.
 */
@Module({
  providers: [EmailService, EmailProcessor, EmailQueueProvider],
  exports: [EmailService],
})
export class EmailModule {}
