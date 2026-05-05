/**
 * @fileoverview Constants for the SMS module.
 *
 * A dedicated `auth-sms` BullMQ queue is used for all authentication-related
 * SMS operations (OTP delivery) to:
 *  - Prevent main request flow from being blocked by SMS gateway I/O.
 *  - Allow concurrency, retry policy, and Redis DB to be tuned independently.
 *  - Ensure SMS failures are retried without impacting other queues.
 */

/**
 * BullMQ queue name for authentication SMS delivery (OTP).
 * Backed by `REDIS_DB_AUTH_SMS_QUEUE`.
 */
export const AUTH_SMS_QUEUE = 'auth-sms';

/**
 * BullMQ job name used inside {@link AUTH_SMS_QUEUE}.
 */
export const AUTH_SMS_JOB = 'send-auth-sms';

/**
 * Maximum delivery attempts before the job is permanently failed.
 * Kept lower than email (3 vs 5) because SMS gateways are typically
 * faster to give a definitive failure signal.
 */
export const AUTH_SMS_MAX_ATTEMPTS = 3;
