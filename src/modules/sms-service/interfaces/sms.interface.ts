/**
 * @fileoverview Interfaces for the SMS module.
 */

/** Payload stored inside each BullMQ auth-SMS job. */
export interface SmsJobData {
  /**
   * Recipient phone number in E.164 format (`+8801XXXXXXXXX`).
   * Normalisation to E.164 is done before the job is enqueued.
   */
  to: string;

  /** Plain-text message body to deliver. */
  message: string;
}
