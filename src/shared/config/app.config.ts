/**
 * @fileoverview Centralized application configuration.
 *
 * Loads environment variables from `.env` using `dotenv` and exposes them as
 * a strongly-typed, frozen configuration object. Every service imports config
 * from here — never reads `process.env` directly.
 *
 * Changes:
 *  - Removed: MONGO_URI (Mongoose migration)
 *  - Added:   DATABASE_URL (PostgreSQL connection string for Prisma)
 *  - Added:   TRUSTED_PROXIES (comma-separated CIDR list for proxy-safe IP resolution)
 *  - Added:   THROTTLE_* env vars (all throttle limits/TTLs; see throttle.config.ts)
 */
import dotenv from 'dotenv';

dotenv.config();

/** Strongly-typed application configuration shape. */
interface AppConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  FRONTEND_URL: string;

  JWT_EXPIRES_IN: number;
  JWT_SECRET: string;

  BCRYPT_SALT_ROUNDS: number;

  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_FROM_NAME: string;
  MAIL_FROM_EMAIL: string;

  /** PostgreSQL connection string used by Prisma. */
  DATABASE_URL: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_DB_AUTH: number;
  REDIS_DB_SESSION: number;
  REDIS_DB_THROTTLE: number;
  /** Redis DB index for the general email BullMQ queue. */
  REDIS_DB_EMAIL_QUEUE: number;
  /** Redis DB index for the auth/OTP-specific BullMQ email queue. */
  REDIS_DB_AUTH_EMAIL_QUEUE: number;
  /** Redis DB index for the auth/OTP-specific BullMQ SMS queue. */
  REDIS_DB_AUTH_SMS_QUEUE: number;

  /**
   * Comma-separated list of trusted proxy CIDRs / IPs.
   * Used by resolveClientIp() to validate forwarded-for headers.
   * Defaults to Cloudflare ranges + private ranges when not set.
   */
  TRUSTED_PROXIES: string;
}

const int = (key: string, fallback?: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback ?? NaN;
  return parseInt(raw, 10);
};

const str = (key: string, fallback = ''): string =>
  process.env[key] ?? fallback;

const config: AppConfig = Object.freeze({
  PORT: int('PORT', 3000),
  NODE_ENV: (process.env.NODE_ENV as AppConfig['NODE_ENV']) || 'development',
  FRONTEND_URL: str('FRONTEND_URL'),

  JWT_EXPIRES_IN: int('JWT_EXPIRES_IN'),
  JWT_SECRET: str('JWT_SECRET'),

  BCRYPT_SALT_ROUNDS: int('BCRYPT_SALT_ROUNDS', 12),

  MAIL_HOST: str('MAIL_HOST'),
  MAIL_PORT: int('MAIL_PORT', 587),
  MAIL_USER: str('MAIL_USER'),
  MAIL_PASS: str('MAIL_PASS'),
  MAIL_FROM_NAME: str('MAIL_FROM_NAME'),
  MAIL_FROM_EMAIL: str('MAIL_FROM_EMAIL'),

  DATABASE_URL: str('DATABASE_URL'),

  REDIS_HOST: str('REDIS_HOST', '127.0.0.1'),
  REDIS_PORT: int('REDIS_PORT', 6379),
  REDIS_PASSWORD: str('REDIS_PASSWORD'),
  REDIS_DB_AUTH: int('REDIS_DB_AUTH', 0),
  REDIS_DB_SESSION: int('REDIS_DB_SESSION', 1),
  REDIS_DB_THROTTLE: int('REDIS_DB_THROTTLE', 2),
  REDIS_DB_EMAIL_QUEUE: int('REDIS_DB_EMAIL_QUEUE', 3),
  REDIS_DB_AUTH_EMAIL_QUEUE: int('REDIS_DB_AUTH_EMAIL_QUEUE', 4),
  REDIS_DB_AUTH_SMS_QUEUE: int('REDIS_DB_AUTH_SMS_QUEUE', 5),

  TRUSTED_PROXIES: str('TRUSTED_PROXIES'),
});

export default config;
