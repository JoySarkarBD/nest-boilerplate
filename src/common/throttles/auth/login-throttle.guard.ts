/**
 * @fileoverview Login throttle guard.
 *
 * Limits how often a single device can submit a login request
 * using the `LOGIN` rate-limit constants.
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisClientService } from '../../redis/redis.client';
import { BaseThrottleGuard, ThrottleConfig } from '../base-throttle.guard';
import { LOGIN } from './auth-throttle.constants';

/**
 * Throttle guard for the login endpoint.
 * Limits the number of login attempts from a single device to prevent brute-force.
 */
@Injectable()
export class LoginThrottleGuard extends BaseThrottleGuard {
  constructor(redis: RedisClientService) {
    const config: ThrottleConfig = {
      keyPrefix: LOGIN.KEY_PREFIX,
      ttlSeconds: LOGIN.TTL_SECONDS,
      limit: LOGIN.LIMIT,
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
