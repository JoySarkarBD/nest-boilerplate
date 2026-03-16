/**
 * @fileoverview Verify-otp throttle guard.
 *
 * Limits how often a single device can request a OTP verification
 * using the `VERIFY_OTP` rate-limit constants.
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisClientService } from '../../redis/redis.client';
import { BaseThrottleGuard, ThrottleConfig } from '../base-throttle.guard';
import { VERIFY_OTP } from './auth-throttle.constants';

/**
 * Throttle guard for the verify-otp endpoint.
 * Ensures that a single device cannot flood the system with OTP verification requests.
 */
@Injectable()
export class VerifyOtpThrottleGuard extends BaseThrottleGuard {
  constructor(redis: RedisClientService) {
    const config: ThrottleConfig = {
      keyPrefix: VERIFY_OTP.KEY_PREFIX,
      ttlSeconds: VERIFY_OTP.TTL_SECONDS,
      limit: VERIFY_OTP.LIMIT,
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
