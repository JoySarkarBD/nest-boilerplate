/**
 * @fileoverview Auth throttle constants.
 *
 * Rate-limit configuration for authentication-related endpoints
 * (forgot-password, reset-password).
 */

/** Throttle configuration for forgot-password requests. */
export const FORGOT_PASSWORD = {
  /** Maximum number of requests allowed within the TTL window. */
  LIMIT: 1,
  /** Time window in seconds. */
  TTL_SECONDS: 120, // 2 minutes
  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:forgot',
};

/** Throttle configuration for reset-password attempts. */
export const RESET_PASSWORD = {
  /** Maximum number of attempts allowed within the TTL window. */
  LIMIT: 3,
  /** Time window in seconds. */
  TTL_SECONDS: 120, // 2 minutes
  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:reset',
};
