/**
 * @fileoverview Validation constraint message getter.
 *
 * Owns all field-level DTO validation messages used by {@link I18nValidationPipe}
 * to translate class-validator constraint errors into the request locale.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 *   import { getValidationMessages } from 'src/common/i18n';
 *   const v = getValidationMessages(lang);
 *   v.SHOULD_NOT_BE_EMPTY('fullName')   // → "fullName should not be empty"
 *   v.PASSWORD_COMPLEXITY               // → "Password must contain …"
 *
 * ── Adding a new validation rule ─────────────────────────────────────────────
 *  1. Add the key + function/value to locales/en/validation.ts (VALIDATION_EN).
 *  2. Add the matching key to locales/bn/validation.ts (VALIDATION_BN).
 *  3. Add a branch in I18nValidationPipe.translateConstraint() that maps
 *     the class-validator constraintName to your new key.
 *  TypeScript will error at compile time if BN is missing any key.
 *
 * @module i18n/messages/validation.messages
 */
import { VALIDATION_BN } from '../locales/bn/validation';
import { VALIDATION_EN, ValidationLocale } from '../locales/en/validation';
import type { SupportedLang } from '../core/types';

// ─── Shape contract ───────────────────────────────────────────────────────────

/**
 * All validation constraint message keys.
 * Typed against {@link ValidationLocale} — BN already enforces this via that type.
 */
export type ValidationMessageMap = ValidationLocale;

// ─── Registry ─────────────────────────────────────────────────────────────────

const REGISTRY: Record<SupportedLang, ValidationMessageMap> = {
  en: VALIDATION_EN,
  bn: VALIDATION_BN,
  // Add new locales here: ar: VALIDATION_AR,
};

// ─── Getter ───────────────────────────────────────────────────────────────────

/**
 * Returns the validation message map for the given locale.
 *
 * @param lang - Resolved locale (from {@link resolveLang} or {@link resolveLangFromRequest}).
 */
export function getValidationMessages(
  lang: SupportedLang,
): ValidationMessageMap {
  return REGISTRY[lang];
}
