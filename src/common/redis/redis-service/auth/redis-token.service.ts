/**
 * @fileoverview Redis token service.
 * Manages JWT authentication tokens in Redis — store, retrieve, and delete.
 */
import { Injectable, Logger } from '@nestjs/common';
import { RedisClientService } from '../../redis.client';
import { REDIS_TOKEN_PREFIX } from '../../constants/auth/auth.constants';

/** Stores, retrieves, and deletes JWT tokens in Redis with a scoped key prefix. */
@Injectable()
export class RedisTokenService {
  private readonly logger = new Logger(RedisTokenService.name);

  constructor(private readonly redisClient: RedisClientService) {}

  /**
   * Store a token in Redis with a TTL.
   * @param tokenId - Unique token identifier (used as part of the Redis key).
   * @param token - The JWT string to store.
   * @param ttlSeconds - Expiry time in seconds.
   */
  async storeToken(
    tokenId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = REDIS_TOKEN_PREFIX + tokenId;
    this.logger.debug(`Storing token key=${key} ttl=${ttlSeconds}s`);
    await this.redisClient.getClientAuth().set(key, token, 'EX', ttlSeconds);
  }

  /**
   * Retrieve a token from Redis.
   * @param tokenId - Unique token identifier.
   * @returns The stored token string, or `null` if not found / expired.
   */
  async getToken(tokenId: string): Promise<string | null> {
    const key = REDIS_TOKEN_PREFIX + tokenId;
    this.logger.debug(`Retrieving token key=${key}`);
    return this.redisClient.getClientAuth().get(key);
  }

  /**
   * Delete a token from Redis (e.g., on logout or invalidation).
   * @param tokenId - Unique token identifier.
   */
  async deleteToken(tokenId: string): Promise<void> {
    const key = REDIS_TOKEN_PREFIX + tokenId;
    this.logger.debug(`Deleting token key=${key}`);
    await this.redisClient.getClientAuth().del(key);
  }
}
