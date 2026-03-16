/**
 * @fileoverview Register throttle guard.
 *
 * Limits how often a single device can request a registration
 * using the `Register` rate-limit constants.
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisClientService } from '../../redis/redis.client';
import { BaseThrottleGuard, ThrottleConfig } from '../base-throttle.guard';
import { REGISTER } from './auth-throttle.constants';

/**
 * Throttle guard for the register endpoint.
 * Ensures that a single device cannot flood the system with registration requests.
 */
@Injectable()
export class RegisterThrottleGuard extends BaseThrottleGuard {
  constructor(redis: RedisClientService) {
    const config: ThrottleConfig = {
      keyPrefix: REGISTER.KEY_PREFIX,
      ttlSeconds: REGISTER.TTL_SECONDS,
      limit: REGISTER.LIMIT,
    };
    super(redis, config);
  }

  /**
   * Build unique identifier from deviceId for throttling.
   * @param req - Express request
   * @returns string identifier
   * @throws HttpException if deviceId is missing
   */
  protected buildIdentifier(req: Request): string {
    const deviceId = req.headers['x-device-id'] as string;
    if (!deviceId) {
      throw new HttpException(
        'Device identifier missing - x-device-id header is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return `${deviceId}`;
  }
}
