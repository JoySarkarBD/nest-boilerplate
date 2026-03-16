/**
 * @fileoverview Resend verification email throttle guard.
 *
 * Limits how often a single device can request a verification email
 * using the `ResendVerificationEmail` rate-limit constants.
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisClientService } from '../../redis/redis.client';
import { BaseThrottleGuard, ThrottleConfig } from '../base-throttle.guard';
import { RESEND_VERIFICATION_EMAIL } from './auth-throttle.constants';

/**
 * Throttle guard for the resend verification email endpoint.
 * Ensures that a single device cannot flood the system with verification email requests.
 */
@Injectable()
export class ResendVerificationEmailThrottleGuard extends BaseThrottleGuard {
  constructor(redis: RedisClientService) {
    const config: ThrottleConfig = {
      keyPrefix: RESEND_VERIFICATION_EMAIL.KEY_PREFIX,
      ttlSeconds: RESEND_VERIFICATION_EMAIL.TTL_SECONDS,
      limit: RESEND_VERIFICATION_EMAIL.LIMIT,
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
