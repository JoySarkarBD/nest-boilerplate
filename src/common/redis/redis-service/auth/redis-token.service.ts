/**
 * @fileoverview Redis token service.
 *
 * Manages JWT authentication tokens in Redis — store with TTL,
 * retrieve, and delete. Used by JwtStrategy and AuthService.
 */
import { Injectable, Logger } from '@nestjs/common';
import { RedisClientService } from '../../redis.client';
import { REDIS_TOKEN_PREFIX } from '../../constants/auth/auth.constants';

/**
 * Logger-enabled Redis token service to aid debugging when tokens
 * aren't found. Logs the Redis key used for store/get/delete.
 */
@Injectable()
export class RedisTokenService {
  private readonly logger = new Logger(RedisTokenService.name);
  constructor(private readonly redisClient: RedisClientService) {}

  /**
   * Store a token in Redis with a specified TTL (time-to-live). The token is stored with a key that combines a predefined prefix and the token ID, allowing for organized storage and easy retrieval. The TTL ensures that tokens are automatically removed from Redis after a certain period, enhancing security by limiting the lifespan of authentication tokens.
   * @param tokenId - The unique identifier for the token, which is used to construct the Redis key.
   * @param token - The actual token string that needs to be stored in Redis.
   * @param ttlSeconds - The time-to-live for the token in seconds, after which the token will expire and be automatically deleted from Redis.
   */
  async storeToken(tokenId: string, token: string, ttlSeconds: number) {
    const key = REDIS_TOKEN_PREFIX + tokenId;
    this.logger.debug(`Storing token key=${key} ttl=${ttlSeconds}s`);
    await this.redisClient.getClientAuth().set(key, token, 'EX', ttlSeconds);
  }

  /**
   * Retrieve a token from Redis using the token ID. The method constructs the Redis key using a predefined prefix and the token ID, then fetches the corresponding token value from Redis. If the token exists, it is returned; otherwise, null is returned to indicate that the token was not found or has expired.
   * @param tokenId - The unique identifier for the token, which is used to construct the Redis key for retrieval.
   * @returns The token string if found in Redis; otherwise, null if the token does not exist or has expired.
   */
  async getToken(tokenId: string) {
    const key = REDIS_TOKEN_PREFIX + tokenId;
    this.logger.debug(`Retrieving token key=${key}`);
    return await this.redisClient.getClientAuth().get(key);
  }

  /**
   * Delete a token from Redis using the token ID. The method constructs the Redis key using a predefined prefix and the token ID, then deletes the corresponding key-value pair from Redis. This is typically used when a user logs out or when a token needs to be invalidated before its natural expiration.
   * @param tokenId - The unique identifier for the token, which is used to construct the Redis key for deletion.
   */
  async deleteToken(tokenId: string) {
    const key = REDIS_TOKEN_PREFIX + tokenId;
    this.logger.debug(`Deleting token key=${key}`);
    await this.redisClient.getClientAuth().del(key);
  }
}
