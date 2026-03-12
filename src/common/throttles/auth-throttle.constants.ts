/**
 * @fileoverview Auth throttle constants.
 *
 * Rate-limit configuration for authentication-related endpoints
 * (forgot-password, reset-password).
 */
export const FORGOT_PASSWORD = {
  LIMIT: 1,
  TTL_SECONDS: 120, // 2 minutes
  KEY_PREFIX: 'throttle:auth:forgot',
};

export const RESET_PASSWORD = {
  LIMIT: 3,
  TTL_SECONDS: 120, // 2 minutes
  KEY_PREFIX: 'throttle:auth:reset',
};
