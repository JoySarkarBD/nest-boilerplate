/**
 * @fileoverview Localised system-level message strings.
 *
 * Covers all infrastructure-layer responses that originate outside
 * business services — validation pipe errors, throttle guard rejections,
 * JWT/roles guard failures, and generic HTTP exception messages.
 *
 * Supported locales: `en` (English — default), `bn` (Bengali).
 *
 * Usage:
 *   import { getSystemMessages, resolveLangFromRequest } from 'src/common/i18n/system.messages';
 *   const lang = resolveLangFromRequest(req);
 *   const m = getSystemMessages(lang);
 *   throw new UnauthorizedException(m.SESSION_EXPIRED);
 */
import type { FastifyRequest } from 'fastify';
import { SupportedLang } from './auth.messages';

// ─── Message shape ────────────────────────────────────────────────────────────

/** All keys that must be present in every locale. */
export interface SystemMessageMap {
  // ── Validation pipe ────────────────────────────────────────────────────────
  /** Generic top-level validation failure message. */
  VALIDATION_FAILED: string;
  /** Bulk validation failure message. */
  BULK_VALIDATION_FAILED: string;
  /** Body must be an array (bulk endpoints). */
  BODY_MUST_BE_ARRAY: string;
  /** Body array must not be empty. */
  BODY_MUST_NOT_BE_EMPTY: string;

  // ── Throttle guard ─────────────────────────────────────────────────────────
  /** Too many requests — rate limit exceeded. */
  TOO_MANY_REQUESTS: string;
  /** x-device-id header missing. */
  DEVICE_ID_MISSING: string;
  /** Generic identifier missing for throttling. */
  THROTTLE_IDENTIFIER_MISSING: string;

  // ── JWT guard ──────────────────────────────────────────────────────────────
  /** Authorization header absent or malformed. */
  AUTH_HEADER_MISSING: string;
  /** Redis session not found (expired or logged out). */
  SESSION_EXPIRED: string;
  /** Passport JWT validation failure (signature/expiry). */
  INVALID_TOKEN: string;

  // ── Roles guard ────────────────────────────────────────────────────────────
  /** User's role record not present on request. */
  ROLE_NOT_FOUND: string;
  /** User's role is not in the required set. */
  INSUFFICIENT_PERMISSIONS: string;

  // ── Generic HTTP ───────────────────────────────────────────────────────────
  /** Route not found. */
  PATH_NOT_FOUND: string;
  /** Unhandled server-side error. */
  INTERNAL_SERVER_ERROR: string;
}

// ─── Locale definitions ───────────────────────────────────────────────────────

const SYSTEM_MESSAGES: Record<SupportedLang, SystemMessageMap> = {
  en: {
    // Validation
    VALIDATION_FAILED: 'Validation failed',
    BULK_VALIDATION_FAILED: 'Bulk validation failed',
    BODY_MUST_BE_ARRAY: 'Request body must be an array',
    BODY_MUST_NOT_BE_EMPTY: 'Request body must contain at least one payload',

    // Throttle
    TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
    DEVICE_ID_MISSING:
      'Device identifier missing — x-device-id header is required',
    THROTTLE_IDENTIFIER_MISSING:
      'Required identifier for throttling is missing',

    // JWT
    AUTH_HEADER_MISSING: 'Authorization header is missing or malformed',
    SESSION_EXPIRED: 'Session expired or invalid token',
    INVALID_TOKEN: 'Invalid or expired token',

    // Roles
    ROLE_NOT_FOUND: 'User role not found',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

    // Generic
    PATH_NOT_FOUND: 'Path not found',
    INTERNAL_SERVER_ERROR: 'Internal server error',
  },

  bn: {
    // Validation
    VALIDATION_FAILED: 'যাচাইকরণ ব্যর্থ হয়েছে',
    BULK_VALIDATION_FAILED: 'বাল্ক যাচাইকরণ ব্যর্থ হয়েছে',
    BODY_MUST_BE_ARRAY: 'অনুরোধের বডি একটি অ্যারে হতে হবে',
    BODY_MUST_NOT_BE_EMPTY: 'অনুরোধের বডিতে অন্তত একটি পেলোড থাকতে হবে',

    // Throttle
    TOO_MANY_REQUESTS:
      'অনেক বেশি অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
    DEVICE_ID_MISSING: 'ডিভাইস পরিচিতি অনুপস্থিত — x-device-id হেডার প্রয়োজন',
    THROTTLE_IDENTIFIER_MISSING:
      'রেট লিমিটিংয়ের জন্য প্রয়োজনীয় পরিচিতি অনুপস্থিত',

    // JWT
    AUTH_HEADER_MISSING: 'অনুমোদন হেডার অনুপস্থিত বা ভুল ফরম্যাটে আছে',
    SESSION_EXPIRED: 'সেশনের মেয়াদ শেষ হয়েছে বা টোকেন অকার্যকর',
    INVALID_TOKEN: 'টোকেন অকার্যকর বা মেয়াদ শেষ হয়ে গেছে',

    // Roles
    ROLE_NOT_FOUND: 'ব্যবহারকারীর ভূমিকা পাওয়া যায়নি',
    INSUFFICIENT_PERMISSIONS: 'অপর্যাপ্ত অনুমতি',

    // Generic
    PATH_NOT_FOUND: 'পাথ পাওয়া যায়নি',
    INTERNAL_SERVER_ERROR: 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract and resolve the locale from a raw Fastify request object.
 *
 * Reads the `lang` header (case-insensitive), falling back to `"en"` for
 * any unknown or absent value.  Centralises header extraction so guards,
 * filters, and pipes don't each duplicate this logic.
 *
 * @param req - Fastify request (or any object with a `headers` map).
 */
export function resolveLangFromRequest(
  req:
    | FastifyRequest
    | { headers?: Record<string, string | string[] | undefined> },
): SupportedLang {
  const raw = (req as FastifyRequest).headers?.['lang'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? '').toLowerCase().trim() === 'bn' ? 'bn' : 'en';
}

/**
 * Returns the full system message map for the requested locale.
 *
 * @param lang - Resolved locale (use {@link resolveLangFromRequest}).
 */
export function getSystemMessages(lang: SupportedLang): SystemMessageMap {
  return SYSTEM_MESSAGES[lang];
}
