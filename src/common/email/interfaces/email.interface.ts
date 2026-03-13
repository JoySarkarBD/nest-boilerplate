/** Payload stored inside each BullMQ email job. */
export interface EmailJobData {
  /** One recipient address per job (bulk send creates one job per address). */
  to: string;
  subject: string;
  /** Caller-supplied HTML body. */
  html?: string;
  /** Plain-text fallback body. */
  text?: string;
}
