/**
 * @fileoverview Email queue provider.
 * This file defines the BullMQ queue provider for the email module.
 */
import { Provider } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from './constants/email.constants';
import { RedisClientService } from '../redis/redis.client';

/**
 * EmailQueueProvider is a factory provider that creates and configures
 * the BullMQ queue instance for emails.
 */
export const EmailQueueProvider: Provider = {
  provide: EMAIL_QUEUE,
  inject: [RedisClientService],
  useFactory: (redisClientService: RedisClientService) => {
    return new Queue(EMAIL_QUEUE, {
      connection: redisClientService.getClientEmailQueueOptions(),
    });
  },
};
