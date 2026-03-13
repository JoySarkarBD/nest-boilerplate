/**
 * @fileoverview Centralized application configuration.
 *
 * Loads environment variables from `.env` using `dotenv` and
 * exposes them as a strongly-typed, frozen configuration object.
 * Every service in the monorepo should import config from here
 * instead of reading `process.env` directly.
 */

import dotenv from 'dotenv';

dotenv.config();

/** Strongly-typed shape of the application configuration. */
interface AppConfig {
  /** Port the API Gateway listens on. */
  PORT: number;

  /** JWT token lifetime in seconds (default: 30 days). */
  JWT_EXPIRES_IN: number;
  /** Secret key used to sign JWT tokens. */
  JWT_SECRET: string;

  /** bcrypt salt rounds for password hashing. */
  BCRYPT_SALT_ROUNDS: number;

  /** SMTP host for outgoing emails. */
  MAIL_HOST: string;
  /** SMTP port. */
  MAIL_PORT: number;
  /** SMTP authentication username. */
  MAIL_USER: string;
  /** SMTP authentication password / app password. */
  MAIL_PASS: string;
  /** Display name used in the `From` header. */
  MAIL_FROM_NAME: string;
  /** Email address used in the `From` header. */
  MAIL_FROM_EMAIL: string;

  /** MongoDB connection URI. */
  MONGO_URI: string;

  /** Redis server hostname. */
  REDIS_HOST: string;
  /** Redis server port. */
  REDIS_PORT: number;
  /** Redis server password (empty string if none). */
  REDIS_PASSWORD: string;
  /** Redis database index for auth tokens. */
  REDIS_DB_AUTH: number;
  /** Redis database index for session data. */
  REDIS_DB_SESSION: number;
  /** Redis database index for throttle counters. */
  REDIS_DB_THROTTLE: number;
  /** Redis database index for email queue. */
  REDIS_DB_EMAIL_QUEUE: number;
}

/**
 * Reads a single environment variable and parses it as an integer.
 *
 * @param key - Name of the environment variable.
 * @returns The parsed integer value, or `NaN` if the variable is missing.
 */
const int = (key: string): number => parseInt(process.env[key] as string, 10);

/**
 * Reads a single environment variable as a string.
 *
 * @param key - Name of the environment variable.
 * @returns The raw string value.
 */
const str = (key: string): string => process.env[key] as string;

/** Application-wide configuration object. */
const config: AppConfig = {
  PORT: int('PORT'),

  JWT_EXPIRES_IN: int('JWT_EXPIRES_IN'),
  JWT_SECRET: str('JWT_SECRET'),

  BCRYPT_SALT_ROUNDS: int('BCRYPT_SALT_ROUNDS'),

  MAIL_HOST: str('MAIL_HOST'),
  MAIL_PORT: int('MAIL_PORT'),
  MAIL_USER: str('MAIL_USER'),
  MAIL_PASS: str('MAIL_PASS'),
  MAIL_FROM_NAME: str('MAIL_FROM_NAME'),
  MAIL_FROM_EMAIL: str('MAIL_FROM_EMAIL'),

  MONGO_URI: str('MONGO_URI'),

  REDIS_HOST: str('REDIS_HOST'),
  REDIS_PORT: int('REDIS_PORT'),
  REDIS_PASSWORD: str('REDIS_PASSWORD'),
  REDIS_DB_AUTH: int('REDIS_DB_AUTH'),
  REDIS_DB_SESSION: int('REDIS_DB_SESSION'),
  REDIS_DB_THROTTLE: int('REDIS_DB_THROTTLE'),
  REDIS_DB_EMAIL_QUEUE: int('REDIS_DB_EMAIL_QUEUE'),
};

export default config;
