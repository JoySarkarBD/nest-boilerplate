/**
 * @fileoverview English locale — DTO field-level validation constraint messages.
 *
 * ── Authoring contract ───────────────────────────────────────────────────────
 *
 * Function-style keys (SHOULD_NOT_BE_EMPTY, MUST_BE_EMAIL, …) accept the
 * field name and optional numeric args so the message reads naturally:
 *   SHOULD_NOT_BE_EMPTY('fullName') → "fullName should not be empty"
 *   MIN_LENGTH('password', 8)      → "password must be at least 8 characters"
 *
 * String keys (PASSWORD_COMPLEXITY, EMAIL_OR_PHONE_EXCLUSIVE, OTP_EXACT_LENGTH)
 * are field-agnostic — the same phrasing applies regardless of which field
 * the decorator is on.
 *
 * ── How to add a new rule ────────────────────────────────────────────────────
 *  1. Add the key + value here.
 *  2. Add the matching key + Bengali value in locales/bn/validation.ts.
 *     TypeScript will error if the BN file is missing any key.
 *  3. Add a branch in I18nValidationPipe.translateConstraint() that maps
 *     the class-validator constraintName (or sentinel string) to the key.
 *
 * @module i18n/locales/en/validation
 */
import type { MessageMap } from '../../core/types';

export const VALIDATION_EN = {
  // ── Generic built-in constraint translations ───────────────────────────────

  /** @IsNotEmpty() — field must not be empty */
  SHOULD_NOT_BE_EMPTY: (field: string) => `${field} should not be empty`,

  /** @IsString() — field must be a string */
  MUST_BE_STRING: (field: string) => `${field} must be a string`,

  /** @IsEmail() — field must be a valid email */
  MUST_BE_EMAIL: (field: string) => `${field} must be a valid email address`,

  /** @MinLength(n) */
  MIN_LENGTH: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,

  /** @MaxLength(n) */
  MAX_LENGTH: (field: string, max: number) =>
    `${field} must not exceed ${max} characters`,

  /** @Length(n, n) where min === max */
  EXACT_LENGTH: (field: string, len: number) =>
    `${field} must be exactly ${len} characters`,

  /** @IsEnum() */
  MUST_BE_ENUM: (field: string, values: string[]) =>
    `${field} must be one of: ${values.join(', ')}`,

  /** @Matches(BD phone regex) */
  MUST_BE_VALID_PHONE: (field: string) =>
    `${field} must be a valid Bangladeshi mobile number (e.g. +8801712345678)`,

  // ── Custom / domain-specific constraint translations ───────────────────────

  /** @Matches(password complexity regex) */
  PASSWORD_COMPLEXITY:
    'Password must contain at least one uppercase letter, lowercase letter, number, and special character',

  /** @IsEmailOrPhoneExclusive() cross-field XOR constraint */
  EMAIL_OR_PHONE_EXCLUSIVE:
    'Provide either email or phone — not both and not neither.',

  /** @Length(6, 6) on OTP fields (when min === max === 6) */
  OTP_EXACT_LENGTH: 'OTP must be exactly 6 digits',
} as const;

/**
 * Shape contract — BN locale is typed against this so TypeScript
 * errors at compile time if any key is missing or has a wrong signature.
 */
export type ValidationLocale = MessageMap<typeof VALIDATION_EN>;
