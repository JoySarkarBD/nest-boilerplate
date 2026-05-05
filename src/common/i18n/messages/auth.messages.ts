/**
 * @fileoverview Auth service message getter.
 *
 * Owns all response messages for the auth-service module:
 * registration, login, OTP flows, password management, logout.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 *   import { getAuthMessages } from 'src/common/i18n';
 *   const m = getAuthMessages(lang);
 *   throw new ConflictException(m.EMAIL_ALREADY_REGISTERED);
 *
 * ── Adding a new message key ─────────────────────────────────────────────────
 *  1. Add the key + English value to locales/en/auth.ts (AUTH_EN).
 *  2. Add the key + translated value to locales/bn/auth.ts (AUTH_BN).
 *     TypeScript will error at compile time if BN is missing any key.
 *  Done — no changes needed anywhere else.
 *
 * @module i18n/messages/auth.messages
 */
import { AUTH_BN } from '../locales/bn/auth';
import { AUTH_EN } from '../locales/en/auth';
import type { MessageMap, SupportedLang } from '../core/types';

// ─── Shape contract ───────────────────────────────────────────────────────────

/** All auth business message keys. TypeScript enforces this on every locale. */
export type AuthMessageMap = MessageMap<typeof AUTH_EN>;

// Compile-time parity check: BN must implement every key EN defines.
const _checkBn: AuthMessageMap = AUTH_BN;
void _checkBn;

// ─── Registry ─────────────────────────────────────────────────────────────────

const REGISTRY: Record<SupportedLang, AuthMessageMap> = {
  en: AUTH_EN,
  bn: AUTH_BN,
  // Add new locales here: ar: AUTH_AR,
};

// ─── Getter ───────────────────────────────────────────────────────────────────

/**
 * Returns the auth message map for the given locale.
 *
 * @param lang - Resolved locale (from {@link resolveLang} or {@link resolveLangFromRequest}).
 */
export function getAuthMessages(lang: SupportedLang): AuthMessageMap {
  return REGISTRY[lang];
}
