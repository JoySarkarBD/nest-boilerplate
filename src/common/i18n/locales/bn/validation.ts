/**
 * @fileoverview Bengali locale — DTO field-level validation constraint messages.
 *
 * Must cover every key defined in {@link ValidationLocale} (the EN locale type).
 * TypeScript errors at compile time if any key is missing or has a wrong signature.
 *
 * Keep the same function signatures as the EN file — only the string values change.
 *
 * @module i18n/locales/bn/validation
 */
import type { ValidationLocale } from '../en/validation';

export const VALIDATION_BN: ValidationLocale = {
  // ── Generic built-in constraint translations ───────────────────────────────

  SHOULD_NOT_BE_EMPTY: (field: string) => `${field} খালি রাখা যাবে না`,

  MUST_BE_STRING: (field: string) => `${field} একটি টেক্সট (string) হতে হবে`,

  MUST_BE_EMAIL: (field: string) => `${field} একটি বৈধ ইমেইল ঠিকানা হতে হবে`,

  MIN_LENGTH: (field: string, min: number) =>
    `${field} কমপক্ষে ${min} অক্ষরের হতে হবে`,

  MAX_LENGTH: (field: string, max: number) =>
    `${field} সর্বোচ্চ ${max} অক্ষরের বেশি হতে পারবে না`,

  EXACT_LENGTH: (field: string, len: number) =>
    `${field} অবশ্যই ${len} অক্ষরের হতে হবে`,

  MUST_BE_ENUM: (field: string, values: string[]) =>
    `${field} এই মানগুলোর মধ্যে একটি হতে হবে: ${values.join(', ')}`,

  MUST_BE_VALID_PHONE: (field: string) =>
    `${field} একটি বৈধ বাংলাদেশি মোবাইল নম্বর হতে হবে (যেমন: +8801712345678)`,

  // ── Custom / domain-specific constraint translations ───────────────────────

  PASSWORD_COMPLEXITY:
    'পাসওয়ার্ডে অন্তত একটি বড় হাতের অক্ষর, একটি ছোট হাতের অক্ষর, একটি সংখ্যা এবং একটি বিশেষ চিহ্ন থাকতে হবে',

  EMAIL_OR_PHONE_EXCLUSIVE:
    'ইমেইল অথবা ফোন নম্বর — দুটির মধ্যে যেকোনো একটি দিন; দুটি একসাথে বা কোনোটিই নয় গ্রহণযোগ্য নয়।',

  OTP_EXACT_LENGTH: 'ওটিপি অবশ্যই ৬ সংখ্যার হতে হবে',
};
