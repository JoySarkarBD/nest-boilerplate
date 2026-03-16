/**
 * @fileoverview Email job interface.
 * Defines the structure of data processed by the email queue.
 */

/** Payload stored inside each BullMQ email job. */
export interface EmailJobData {
  /** One recipient address per job (bulk send creates one job per address). */
  to: string;
  /** Subject line of the email. */
  subject: string;
  /** Caller-supplied HTML body. */
  html?: string;
  /** Plain-text fallback body. */
  text?: string;
}
