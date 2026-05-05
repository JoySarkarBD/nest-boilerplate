/**
 * @fileoverview Public i18n barrel — the ONLY import path consumers should use.
 *
 * ── Architecture ─────────────────────────────────────────────────────────────
 *
 *   src/common/i18n/
 *   │
 *   ├── core/
 *   │   └── types.ts          ← SupportedLang, DEFAULT_LANG, MessageMap,
 *   │                            resolveLang(), resolveLangFromRequest()
 *   │
 *   ├── locales/              ← Raw string tables. One folder per language.
 *   │   │                       No business logic. No imports between locales.
 *   │   ├── en/
 *   │   │   ├── auth.ts       ← AUTH_EN         (auth-service messages)
 *   │   │   ├── system.ts     ← SYSTEM_EN       (guards, filters, pipes)
 *   │   │   └── validation.ts ← VALIDATION_EN   (DTO constraint messages)
 *   │   └── bn/
 *   │       ├── auth.ts       ← AUTH_BN
 *   │       ├── system.ts     ← SYSTEM_BN
 *   │       └── validation.ts ← VALIDATION_BN
 *   │
 *   ├── messages/             ← Typed getters. One file per message slice.
 *   │   │                       These are the ONLY thing consumers import.
 *   │   ├── auth.messages.ts        → getAuthMessages(lang): AuthMessageMap
 *   │   ├── system.messages.ts      → getSystemMessages(lang): SystemMessageMap
 *   │   └── validation.messages.ts  → getValidationMessages(lang): ValidationMessageMap
 *   │
 *   └── index.ts              ← THIS FILE. Re-exports everything above.
 *
 * ── How to add a NEW LOCALE (e.g. Arabic) ───────────────────────────────────
 *  1. Add `| 'ar'` to SupportedLang in core/types.ts.
 *  2. Add `case 'ar': return 'ar';` to resolveLang() in core/types.ts.
 *  3. Create locales/ar/auth.ts, system.ts, validation.ts (copy en/ as template).
 *  4. Add `ar: AUTH_AR` (etc.) to the REGISTRY in each messages/*.messages.ts.
 *  TypeScript will error at compile time on any missed step.
 *
 * ── How to add a NEW SERVICE's messages (e.g. payment-service) ──────────────
 *  1. Create locales/en/payment.ts  — export const PAYMENT_EN = { ... } as const;
 *  2. Create locales/bn/payment.ts  — export const PAYMENT_BN: PaymentMessageMap = { ... };
 *  3. Create messages/payment.messages.ts — export type PaymentMessageMap, getPaymentMessages().
 *  4. Export getPaymentMessages from this barrel (add line below).
 *  5. Inject getPaymentMessages(lang) in your service/controller.
 *  Zero changes required in guards, filters, or pipes.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 *   import {
 *     resolveLang,
 *     resolveLangFromRequest,
 *     getAuthMessages,
 *     getSystemMessages,
 *     getValidationMessages,
 *   } from 'src/common/i18n';
 *
 *   // In a service:
 *   const m = getAuthMessages(lang);
 *   throw new ConflictException(m.EMAIL_ALREADY_REGISTERED);
 *
 *   // In a guard / filter:
 *   const lang = resolveLangFromRequest(request);
 *   const s = getSystemMessages(lang);
 *   throw new UnauthorizedException(s.SESSION_EXPIRED);
 */

// ─── Core types + resolvers ───────────────────────────────────────────────────
// Import directly from core/types.ts — no index.ts indirection in core/.
export {
  DEFAULT_LANG,
  resolveLang,
  resolveLangFromRequest,
} from './core/types';
export type { MessageMap, SupportedLang } from './core/types';

// ─── Message getters ──────────────────────────────────────────────────────────
// Add a new export here whenever a new service slice is created.
export { getAuthMessages } from './messages/auth.messages';
export type { AuthMessageMap } from './messages/auth.messages';

export { getSystemMessages } from './messages/system.messages';
export type { SystemMessageMap } from './messages/system.messages';

export { getValidationMessages } from './messages/validation.messages';
export type { ValidationMessageMap } from './messages/validation.messages';

// ─── Future service slices ────────────────────────────────────────────────────
// export { getPaymentMessages }   from './messages/payment.messages';
// export { getUserMessages }      from './messages/user.messages';
// export { getNotificationMessages } from './messages/notification.messages';
