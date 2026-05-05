/**
 * @fileoverview Core i18n types and request-level helpers.
 *
 * This is the SINGLE SOURCE OF TRUTH for:
 *  - {@link SupportedLang}            — the union of all supported locale codes.
 *  - {@link DEFAULT_LANG}             — fallback locale.
 *  - {@link MessageMap}               — utility type for locale shape enforcement.
 *  - {@link resolveLang}              — resolve a locale from a raw header string.
 *  - {@link resolveLangFromRequest}   — resolve a locale from a Fastify request.
 *
 * ── Consuming this module ────────────────────────────────────────────────────
 *
 *   // Direct (for locale files and message getters):
 *   import { SupportedLang, MessageMap } from 'src/common/i18n/core/types';
 *
 *   // Via public barrel (preferred for service/guard/filter consumers):
 *   import { SupportedLang, resolveLang, resolveLangFromRequest } from 'src/common/i18n';
 *
 * ── Adding a new locale ──────────────────────────────────────────────────────
 *  1. Add the locale code to {@link SupportedLang} (e.g. `| 'ar'`).
 *  2. Add a case to {@link resolveLang}.
 *  3. Create locales/<code>/ with a file per message slice.
 *  4. Register in each messages/<slice>.messages.ts REGISTRY.
 *  TypeScript compile-time checks will catch every gap.
 *
 * @module i18n/core/types
 */
import type { FastifyRequest } from 'fastify';

// ─── Supported locales ────────────────────────────────────────────────────────

/**
 * Union of all locale codes the application supports.
 *
 * Extend this when adding a new language. TypeScript will surface every
 * REGISTRY and locale file that needs a matching entry.
 */
export type SupportedLang = 'en' | 'bn';

/** Default locale when the `lang` header is absent or unrecognised. */
export const DEFAULT_LANG: SupportedLang = 'en';

// ─── Shape utility ────────────────────────────────────────────────────────────

/**
 * Maps a locale object (e.g. `AUTH_EN`) to a generalised contract:
 * string values stay `string`, function values keep their exact signature.
 *
 * Without this, TypeScript widens literal types ("Login successful" → string),
 * which causes false parity errors when implementing other languages.
 *
 * @example
 *   export type AuthMessageMap = MessageMap<typeof AUTH_EN>;
 *   const _check: AuthMessageMap = AUTH_BN; // compile-time parity guard
 */
export type MessageMap<T> = {
  readonly [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R extends string ? string : R
    : string;
};

// ─── Resolver helpers ─────────────────────────────────────────────────────────

/**
 * Resolve a {@link SupportedLang} from a raw `lang` header string.
 *
 * - Case-insensitive.
 * - Falls back to {@link DEFAULT_LANG} for unknown or empty values.
 *
 * @param raw - Raw value from the `lang` request header.
 */
export function resolveLang(raw: string | undefined): SupportedLang {
  switch ((raw ?? '').toLowerCase().trim()) {
    case 'bn':
      return 'bn';
    // Add new cases here as new locales are introduced:
    // case 'ar': return 'ar';
    default:
      return DEFAULT_LANG;
  }
}

/**
 * Resolve a {@link SupportedLang} from a Fastify request object.
 *
 * Reads the `lang` header and delegates to {@link resolveLang}.
 * Safe to call from guards, filters, pipes, and interceptors.
 *
 * @param req - Fastify request, or any object with a `headers` map.
 */
export function resolveLangFromRequest(
  req:
    | FastifyRequest
    | { headers?: Record<string, string | string[] | undefined> },
): SupportedLang {
  const raw = (req as FastifyRequest).headers?.['lang'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return resolveLang(value);
}
