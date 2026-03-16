/**
 * @fileoverview Constants for the email module, including queue and job names, and retry settings.
 */

/**
 * The name of the Redis queue used for processing email jobs.
 */
export const EMAIL_QUEUE = 'email-queue';

/**
 * The identifier for the job that sends an email.
 */
export const EMAIL_JOB = 'send-email';

/**
 * The maximum number of retry attempts for an email job before it is marked as failed.
 */
export const EMAIL_MAX_ATTEMPTS = 5;
