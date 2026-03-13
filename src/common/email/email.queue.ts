import { Provider } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from './constants/email.constants';
import { RedisClientService } from '../redis/redis.client';

export const EmailQueueProvider: Provider = {
  provide: EMAIL_QUEUE,
  inject: [RedisClientService],
  useFactory: (redisClientService: RedisClientService) => {
    return new Queue(EMAIL_QUEUE, {
      connection: redisClientService.getClientEmailQueueOptions(),
    });
  },
};
