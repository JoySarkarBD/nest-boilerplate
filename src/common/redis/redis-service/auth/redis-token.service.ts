/**
 * @fileoverview Redis token service.
 * Manages JWT authentication tokens in Redis — store, retrieve, and delete.
 */
import { Injectable, Logger } from '@nestjs/common';
import { RedisClientService } from '../../redis.client';

/**
 * RedisTokenService manages the lifecycle of JWT authentication tokens in Redis.
 * It provides methods for storing, retrieving, and invalidating tokens with
 * automatic TTL (Time-To-Live) management.
 */
@Injectable()
export class RedisTokenService {
  private readonly logger = new Logger(RedisTokenService.name);

  constructor(private readonly redisClient: RedisClientService) {}
  /**
   * Store a token in Redis with a TTL.
   * @param tokenId - Unique token identifier.
   * @param token - The JWT string to store.
   * @param ttlSeconds - Expiry time in seconds.
   */
  async storeToken(
    tokenId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    this.logger.debug(`Storing token key=${tokenId} ttl=${ttlSeconds}s`);
    await this.redisClient
      .getClientAuth()
      .set(tokenId, token, 'EX', ttlSeconds);
  }

  /**
   * Retrieve a token from Redis.
   * @param tokenId - Unique token identifier.
   * @returns The stored token string, or `null` if not found / expired.
   */
  async getToken(tokenId: string): Promise<string | null> {
    this.logger.debug(`Retrieving token key=${tokenId}`);
    return this.redisClient.getClientAuth().get(tokenId);
  }

  /**
   * Delete a token from Redis.
   * @param tokenId - Unique token identifier.
   */
  async deleteToken(tokenId: string): Promise<void> {
    this.logger.debug(`Deleting token key=${tokenId}`);
    await this.redisClient.getClientAuth().del(tokenId);
  }

  /**
   * Delete all tokens for a specific user from Redis.
   * @param userId - The user ID whose tokens should be invalidated.
   */
  async deleteUserTokens(userId: string): Promise<void> {
    const pattern = `${userId}:*`;
    this.logger.debug(`Deleting all tokens for user with pattern=${pattern}`);
    const client = this.redisClient.getClientAuth();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}
