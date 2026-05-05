/**
 * @fileoverview Low-level SMS gateway client (sms.net.bd).
 *
 * This class handles only the HTTP transport to the provider.
 * It is **not** injected directly by callers — all callers go through
 * {@link SmsService} which enqueues jobs onto the `auth-sms` BullMQ queue.
 *
 * Configuration (all read from env via {@link config}):
 *  - `SMSNET_API_BASE`    — Provider base URL (default: https://api.sms.net.bd)
 *  - `SMSNET_API_PATH`    — Provider path   (default: /sendsms)
 *  - `SMSNET_API_KEY`     — API key issued by sms.net.bd
 *  - `SMSNET_TIMEOUT_MS`  — HTTP timeout in ms (default: 10 000)
 */
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { URLSearchParams } from 'url';

/** Raw result returned by the gateway client. */
export interface SmsSendResult {
  success: boolean;
  error?: string;
}

@Injectable()
export class SmsGatewayClient {
  private readonly logger = new Logger(SmsGatewayClient.name);

  private readonly apiBase: string;
  private readonly apiPath: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor() {
    this.apiBase = process.env.SMSNET_API_BASE ?? 'https://api.sms.net.bd';
    this.apiPath = process.env.SMSNET_API_PATH ?? '/sendsms';
    this.apiKey = process.env.SMSNET_API_KEY ?? '';
    this.timeoutMs = Number(process.env.SMSNET_TIMEOUT_MS ?? '10000');
  }

  /**
   * Send a plain-text SMS to a single E.164-normalised recipient.
   *
   * When `SMSNET_API_KEY` is not configured the call is short-circuited with
   * a warning log (useful in local development / CI environments).
   *
   * @param toNormalised - Recipient in E.164 format (`+8801XXXXXXXXX`).
   * @param message      - Plain-text message body.
   */
  async sendText(
    toNormalised: string,
    message: string,
  ): Promise<SmsSendResult> {
    if (!this.apiKey) {
      this.logger.warn(
        `SMSNET_API_KEY not configured — skipping real SMS send. ` +
          `Would send to ${toNormalised}: "${message}"`,
      );
      return { success: true };
    }

    try {
      // sms.net.bd expects the number without the leading `+`
      const toParam = toNormalised.replace(/^\+/, '');

      const url = `${this.apiBase}${this.apiPath}`;
      const body = new URLSearchParams();
      body.append('api_key', this.apiKey);
      body.append('msg', message);
      body.append('to', toParam);

      const response = await axios.post<unknown>(url, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: this.timeoutMs,
      });

      const raw = response.data;
      const dataStr = typeof raw === 'string' ? raw : JSON.stringify(raw);

      // Attempt structured parse for providers that return JSON
      let parsed: Record<string, unknown> | undefined;
      try {
        parsed =
          typeof raw === 'string'
            ? JSON.parse(raw)
            : (raw as Record<string, unknown>);
      } catch {
        // Ignore — fall back to string heuristics below
      }

      const looksSuccessful =
        response.status === 200 &&
        ((parsed !== undefined &&
          (parsed['error'] === 0 ||
            parsed['status'] === 'success' ||
            (typeof parsed['msg'] === 'string' &&
              parsed['msg'].toLowerCase().includes('success')))) ||
          /_OK_/i.test(dataStr) ||
          /\bsuccess\b/i.test(dataStr) ||
          /\bSENT\b/i.test(dataStr) ||
          /\brequest successfully submitted\b/i.test(dataStr));

      if (looksSuccessful) {
        this.logger.log(`SMS delivered → ${toNormalised}`);
        return { success: true };
      }

      const truncated = dataStr.slice(0, 200);
      this.logger.warn(
        `SMS gateway rejection for ${toNormalised}: ${truncated}`,
      );
      return { success: false, error: truncated || 'Unknown gateway response' };
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: unknown };
        message?: string;
      };
      const errMsg = axiosErr.response?.data
        ? typeof axiosErr.response.data === 'string'
          ? axiosErr.response.data
          : JSON.stringify(axiosErr.response.data)
        : (axiosErr.message ?? 'SMS gateway request failed');

      const truncated = errMsg.slice(0, 200);
      this.logger.error(`SMS gateway error for ${toNormalised}: ${truncated}`);
      return { success: false, error: truncated };
    }
  }
}
