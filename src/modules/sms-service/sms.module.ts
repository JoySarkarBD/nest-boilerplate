/**
 * @fileoverview SMS module definition.
 *
 * Registers the `auth-sms` BullMQ queue, its background worker, the low-level
 * gateway client, and the {@link SmsService} facade:
 *
 * | Component             | Purpose                                      |
 * |-----------------------|----------------------------------------------|
 * | `AuthSmsQueueProvider`| Creates the BullMQ queue (injection token)   |
 * | `AuthSmsProcessor`    | Worker — consumes jobs, calls gateway        |
 * | `SmsGatewayClient`    | HTTP transport to sms.net.bd                 |
 * | `SmsService`          | Public facade — enqueues jobs                |
 *
 * Import this module in any feature module that needs to send SMS messages.
 * Inject {@link SmsService} and call `sendAuthSms()`.
 *
 * @module sms-service
 */
import { Module } from '@nestjs/common';
import { RedisModule } from 'src/common/redis/redis.module';
import { AuthSmsProcessor } from './auth-sms/auth-sms.processor';
import { AuthSmsQueueProvider } from './auth-sms/auth-sms.queue';
import { SmsGatewayClient } from './sms-gateway.client';
import { SmsService } from './sms.service';

@Module({
  imports: [RedisModule],
  providers: [
    // ── Queue infrastructure ───────────────────────────────────────────────
    AuthSmsQueueProvider,
    AuthSmsProcessor,

    // ── Gateway client & service facade ───────────────────────────────────
    SmsGatewayClient,
    SmsService,
  ],
  exports: [SmsService],
})
export class SmsModule {}
