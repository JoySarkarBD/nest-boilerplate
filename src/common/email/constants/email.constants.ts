/**
 * @fileoverview Constants for the email module, including queue and job names, and retry settings.
 */

/** Email queue name. */
export const EMAIL_QUEUE = 'email-queue';
export const EMAIL_JOB = 'send-email';

/** Number of attempts before a job is considered permanently failed. */
export const EMAIL_MAX_ATTEMPTS = 5;
