/**
 * @fileoverview Reset-password throttle guard.
 *
 * Limits how often a single device can submit a password-reset request
 * using the `RESET_PASSWORD` rate-limit constants.
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisClientService } from '../../redis/redis.client';
import { BaseThrottleGuard, ThrottleConfig } from '../base-throttle.guard';
import { RESET_PASSWORD } from './auth-throttle.constants';

/**
 * Throttle guard for the reset-password endpoint.
 * Limits the number of password reset attempts from a single device to prevent brute-force.
 */
@Injectable()
export class ResetPasswordThrottleGuard extends BaseThrottleGuard {
  constructor(redis: RedisClientService) {
    const config: ThrottleConfig = {
      keyPrefix: RESET_PASSWORD.KEY_PREFIX,
      ttlSeconds: RESET_PASSWORD.TTL_SECONDS,
      limit: RESET_PASSWORD.LIMIT,
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
