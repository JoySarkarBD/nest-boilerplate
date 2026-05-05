/**
 * @fileoverview System/infrastructure message getter.
 *
 * Owns all response messages produced by the infrastructure layer:
 * validation pipe, throttle guards, JWT guard, roles guard, HTTP exceptions.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 *   import { getSystemMessages } from 'src/common/i18n';
 *   const s = getSystemMessages(lang);
 *   throw new UnauthorizedException(s.SESSION_EXPIRED);
 *
 * ── Adding a new message key ─────────────────────────────────────────────────
 *  1. Add the key + English value to locales/en/system.ts (SYSTEM_EN).
 *  2. Add the key + translated value to locales/bn/system.ts (SYSTEM_BN).
 *     TypeScript will error at compile time if BN is missing any key.
 *  Done.
 *
 * @module i18n/messages/system.messages
 */
import { SYSTEM_BN } from '../locales/bn/system';
import { SYSTEM_EN } from '../locales/en/system';
import type { MessageMap, SupportedLang } from '../core/types';

// ─── Shape contract ───────────────────────────────────────────────────────────

/** All system/infrastructure message keys. TypeScript enforces this on every locale. */
export type SystemMessageMap = MessageMap<typeof SYSTEM_EN>;

// Compile-time parity check: BN must implement every key EN defines.
const _checkBn: SystemMessageMap = SYSTEM_BN;
void _checkBn;

// ─── Registry ─────────────────────────────────────────────────────────────────

const REGISTRY: Record<SupportedLang, SystemMessageMap> = {
  en: SYSTEM_EN,
  bn: SYSTEM_BN,
  // Add new locales here: ar: SYSTEM_AR,
};

// ─── Getter ───────────────────────────────────────────────────────────────────

/**
 * Returns the system message map for the given locale.
 *
 * @param lang - Resolved locale (from {@link resolveLang} or {@link resolveLangFromRequest}).
 */
export function getSystemMessages(lang: SupportedLang): SystemMessageMap {
  return REGISTRY[lang];
}
