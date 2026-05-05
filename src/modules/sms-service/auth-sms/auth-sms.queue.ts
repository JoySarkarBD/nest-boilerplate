/**
 * @fileoverview Auth SMS queue provider.
 *
 * Creates a dedicated BullMQ {@link Queue} instance for authentication-critical
 * SMS operations (OTP delivery via sms.net.bd).
 *
 * **Why a separate queue?**
 * Isolating SMS jobs prevents any general backlog from delaying time-sensitive
 * OTP messages. The queue is backed by its own Redis DB index
 * (`REDIS_DB_AUTH_SMS_QUEUE`) and processed by a dedicated worker
 * ({@link AuthSmsProcessor}).
 *
 * Injection token: {@link AUTH_SMS_QUEUE}
 */
import { Provider } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisClientService } from 'src/common/redis/redis.client';
import { AUTH_SMS_QUEUE } from '../constants/sms.constants';

/**
 * NestJS factory provider that creates the BullMQ queue for auth SMS jobs.
 *
 * Registered in {@link SmsModule} and exported so that {@link AuthService}
 * can inject the queue via `@Inject(AUTH_SMS_QUEUE)`.
 */
export const AuthSmsQueueProvider: Provider = {
  provide: AUTH_SMS_QUEUE,
  inject: [RedisClientService],
  useFactory: (redisClientService: RedisClientService) => {
    return new Queue(AUTH_SMS_QUEUE, {
      connection: redisClientService.getClientAuthSmsQueueOptions(),
    });
  },
};
