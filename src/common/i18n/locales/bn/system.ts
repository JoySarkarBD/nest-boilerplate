/**
 * @fileoverview Bengali locale — system/infrastructure messages.
 *
 * Keys must exactly match {@link SystemMessageMap} in messages/system.messages.ts.
 * TypeScript enforces this at compile time — you cannot have a missing or extra key.
 *
 * @module i18n/locales/bn/system
 */
export const SYSTEM_BN = {
  // Validation pipe (top-level labels)
  VALIDATION_FAILED: 'যাচাইকরণ ব্যর্থ হয়েছে',
  BULK_VALIDATION_FAILED: 'বাল্ক যাচাইকরণ ব্যর্থ হয়েছে',
  BODY_MUST_BE_ARRAY: 'অনুরোধের বডি একটি অ্যারে হতে হবে',
  BODY_MUST_NOT_BE_EMPTY: 'অনুরোধের বডিতে অন্তত একটি পেলোড থাকতে হবে',

  // Throttle guard
  TOO_MANY_REQUESTS:
    'অনেক বেশি অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
  DEVICE_ID_MISSING: 'ডিভাইস পরিচিতি অনুপস্থিত — x-device-id হেডার প্রয়োজন',
  THROTTLE_IDENTIFIER_MISSING:
    'রেট লিমিটিংয়ের জন্য প্রয়োজনীয় পরিচিতি অনুপস্থিত',

  // JWT guard
  AUTH_HEADER_MISSING: 'অনুমোদন হেডার অনুপস্থিত বা ভুল ফরম্যাটে আছে',
  SESSION_EXPIRED: 'সেশনের মেয়াদ শেষ হয়েছে বা টোকেন অকার্যকর',
  INVALID_TOKEN: 'টোকেন অকার্যকর বা মেয়াদ শেষ হয়ে গেছে',

  // Roles guard
  ROLE_NOT_FOUND: 'ব্যবহারকারীর ভূমিকা পাওয়া যায়নি',
  INSUFFICIENT_PERMISSIONS: 'অপর্যাপ্ত অনুমতি',

  // Generic HTTP
  PATH_NOT_FOUND: 'পাথ পাওয়া যায়নি',
  INTERNAL_SERVER_ERROR: 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে',
} as const;
