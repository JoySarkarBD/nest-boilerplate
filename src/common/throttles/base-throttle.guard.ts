/**
 * @fileoverview Abstract base throttle guard.
 *
 * Provides a reusable Redis-backed rate-limiter. Concrete subclasses
 * only need to implement `buildIdentifier()` and supply a
 * `ThrottleConfig`.
 */
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';
import { RedisClientService } from '../redis/redis.client';

/**
 * Configuration for a throttle guard.
 */
export interface ThrottleConfig {
  /** Redis key prefix for this throttle */
  keyPrefix: string;
  /** Time-to-live in seconds */
  ttlSeconds: number;
  /** Maximum allowed attempts */
  limit: number;
}

/**
 * Abstract reusable base guard for throttling requests.
 * Child classes define how the identifier is built.
 */
@Injectable()
export abstract class BaseThrottleGuard implements CanActivate {
  constructor(
    protected readonly redis: RedisClientService,
    private readonly config: ThrottleConfig,
  ) {}

  /**
   * Hash a string using SHA-256.
   * @param value - The string to hash
   * @returns Hashed string
   */
  protected hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  /**
   * Child class must implement this to build a unique identifier
   * for throttling (e.g., deviceId + email).
   * @param req - Express request
   * @returns A string representing the unique identifier
   */
  protected abstract buildIdentifier(req: Request): string;

  /**
   * Main canActivate logic to enforce rate limiting.
   * @param context - ExecutionContext provided by NestJS
   * @returns true if request allowed, otherwise throws HttpException
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const rawIdentifier = this.buildIdentifier(req);

    if (!rawIdentifier) {
      throw new HttpException(
        'Required identifier for throttling is missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedIdentifier = this.hash(rawIdentifier);
    const client = this.redis.getClientThrottle();
    const key = `${this.config.keyPrefix}:${hashedIdentifier}`;

    // Atomic increment and set TTL
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, this.config.ttlSeconds);
    }

    if (count > this.config.limit) {
      throw new HttpException(
        'Too many requests. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
