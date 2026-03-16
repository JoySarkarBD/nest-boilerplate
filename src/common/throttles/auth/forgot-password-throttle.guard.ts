/**
 * @fileoverview Forgot-password throttle guard.
 *
 * Limits how often a single device can request a password-reset OTP or Link
 * using the `FORGOT_PASSWORD` rate-limit constants.
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisClientService } from '../../redis/redis.client';
import { BaseThrottleGuard, ThrottleConfig } from '../base-throttle.guard';
import { FORGOT_PASSWORD } from './auth-throttle.constants';

/**
 * Throttle guard for the forgot-password endpoint.
 * Ensures that a single device cannot flood the system with password reset requests.
 */
@Injectable()
export class ForgotPasswordThrottleGuard extends BaseThrottleGuard {
  constructor(redis: RedisClientService) {
    const config: ThrottleConfig = {
      keyPrefix: FORGOT_PASSWORD.KEY_PREFIX,
      ttlSeconds: FORGOT_PASSWORD.TTL_SECONDS,
      limit: FORGOT_PASSWORD.LIMIT,
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
