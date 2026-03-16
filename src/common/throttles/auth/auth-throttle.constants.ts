/**
 * @fileoverview Auth throttle constants.
 *
 * Rate-limit configuration for authentication-related endpoints
 * (login,forgot-password, verify-otp, reset-password).
 */

/** Throttle configuration for login attempts. */
export const LOGIN = {
  /** Maximum number of login attempts allowed within the TTL window. */
  LIMIT: 3,
  /** Time window in seconds. */
  TTL_SECONDS: 300, // 5 minutes
  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:login',
};

export const REGISTER = {
  /** Maximum number of registration attempts allowed within the TTL window. */
  LIMIT: 1,

  /** Time window in seconds. */
  TTL_SECONDS: 3600, // 1 hour

  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:register',
};

/** Throttle configuration for resend verification email requests. */
export const RESEND_VERIFICATION_EMAIL = {
  /** Maximum number of resend attempts allowed within the TTL window. */
  LIMIT: 2,

  /** Time window in seconds. */
  TTL_SECONDS: 3600, // 1 hour

  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:resend-verification',
};

/** Throttle configuration for forgot-password requests. */
export const FORGOT_PASSWORD = {
  /** Maximum number of requests allowed within the TTL window. */
  LIMIT: 1,
  /** Time window in seconds. */
  TTL_SECONDS: 120, // 2 minutes
  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:forgot',
};

export const VERIFY_OTP = {
  /** Maximum number of OTP verification attempts allowed within the TTL window. */
  LIMIT: 5,
  /** Time window in seconds. */
  TTL_SECONDS: 300, // 5 minutes
  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:verify-otp',
};

/** Throttle configuration for reset-password attempts. */
export const RESET_PASSWORD = {
  /** Maximum number of attempts allowed within the TTL window. */
  LIMIT: 5,
  /** Time window in seconds. */
  TTL_SECONDS: 120, // 2 minutes
  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:reset',
};

/** Throttle configuration for change-password attempts. */
export const CHANGE_PASSWORD = {
  /** Maximum number of attempts allowed within the TTL window. */
  LIMIT: 1,

  /** Time window in seconds. */
  TTL_SECONDS: 3600, // 1 hour

  /** Redis key prefix for this throttle bucket. */
  KEY_PREFIX: 'throttle:auth:change',
};
