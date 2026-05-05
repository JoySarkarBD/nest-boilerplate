/**
 * @fileoverview Register throttle guard — multi-layer.
 *
 * Layers enforced (in order):
 *  1. IP + UA hash + optional device-id   (anti-mass-registration per client)
 *  2. Email identity                       (anti-multi-IP spam on same email)
 *  3. Phone identity                       (anti-multi-IP spam on same phone)
 *
 * Email and phone layers are applied only when the respective field is
 * present in the request body.
 *
 * @module throttles/auth
 */
import { Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { RedisClientService } from '../../redis/redis.client';
import {
  BaseThrottleGuard,
  buildHybridIpKey,
  ThrottleLayer,
} from '../base-throttle.guard';
import {
  REGISTER,
  REGISTER_EMAIL,
  REGISTER_PHONE,
} from '../config/throttle.config';

@Injectable()
export class RegisterThrottleGuard extends BaseThrottleGuard {
  constructor(redis: RedisClientService) {
    super(redis);
  }

  protected buildLayers(req: FastifyRequest): ThrottleLayer[] {
    const body = req.body as Record<string, unknown> | undefined;

    const layers: ThrottleLayer[] = [
      {
        identifier: buildHybridIpKey(req),
        config: {
          keyPrefix: REGISTER.KEY_PREFIX,
          ttlSeconds: REGISTER.TTL_SECONDS,
          limit: REGISTER.LIMIT,
          blockSeconds: REGISTER.BLOCK_SECONDS,
          identifierType: 'ip+ua+device',
        },
      },
    ];

    const email = body?.['email'];
    if (typeof email === 'string' && email.includes('@')) {
      layers.push({
        identifier: email.toLowerCase().trim(),
        config: {
          keyPrefix: REGISTER_EMAIL.KEY_PREFIX,
          ttlSeconds: REGISTER_EMAIL.TTL_SECONDS,
          limit: REGISTER_EMAIL.LIMIT,
          identifierType: 'email',
        },
      });
    }

    const phone = body?.['phone'];
    if (typeof phone === 'string' && phone.length >= 7) {
      layers.push({
        identifier: phone.replace(/\s+/g, '').trim(),
        config: {
          keyPrefix: REGISTER_PHONE.KEY_PREFIX,
          ttlSeconds: REGISTER_PHONE.TTL_SECONDS,
          limit: REGISTER_PHONE.LIMIT,
          identifierType: 'phone',
        },
      });
    }

    return layers;
  }
}
