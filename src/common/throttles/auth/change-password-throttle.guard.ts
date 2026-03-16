/**
 * @fileoverview Change-password throttle guard.
 *
 * Limits how often a single device can request a password-change
 * using the `CHANGE_PASSWORD` rate-limit constants.
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisClientService } from '../../redis/redis.client';
import { BaseThrottleGuard, ThrottleConfig } from '../base-throttle.guard';
import { CHANGE_PASSWORD } from './auth-throttle.constants';

/**
 * Throttle guard for the change-password endpoint.
 * Ensures that a single device cannot flood the system with password change requests.
 */
@Injectable()
export class ChangePasswordThrottleGuard extends BaseThrottleGuard {
  constructor(redis: RedisClientService) {
    const config: ThrottleConfig = {
      keyPrefix: CHANGE_PASSWORD.KEY_PREFIX,
      ttlSeconds: CHANGE_PASSWORD.TTL_SECONDS,
      limit: CHANGE_PASSWORD.LIMIT,
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
