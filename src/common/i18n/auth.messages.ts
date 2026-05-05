/**
 * @fileoverview Localised message strings for the auth module.
 *
 * Supported locales: `en` (English — default), `bn` (Bengali).
 *
 * Usage:
 *   import { getAuthMessages } from 'src/common/i18n/auth.messages';
 *   const m = getAuthMessages(lang);
 *   return { message: m.REGISTRATION_SUCCESS };
 *
 * Adding a new locale: add a new key to {@link AUTH_MESSAGES} and ensure
 * {@link SupportedLang} includes the new locale code.
 */

/** Union of all supported locale codes. */
export type SupportedLang = 'en' | 'bn';

/** Shape of every locale entry. All keys are required to prevent silent gaps. */
export interface AuthMessageMap {
  // ── Register ────────────────────────────────────────────────────────────
  REGISTRATION_SUCCESS: string;
  EMAIL_ALREADY_REGISTERED: string;
  PHONE_ALREADY_REGISTERED: string;

  // ── Verify account ──────────────────────────────────────────────────────
  ACCOUNT_VERIFIED: string;
  INVALID_OR_EXPIRED_OTP: string;
  ACCOUNT_ALREADY_VERIFIED: string;

  // ── Resend verification ─────────────────────────────────────────────────
  RESEND_OTP_SAFE_MESSAGE: string;

  // ── Login ───────────────────────────────────────────────────────────────
  LOGIN_SUCCESS: string;
  INVALID_CREDENTIALS: string;
  ACCOUNT_NOT_VERIFIED: string;

  // ── Forgot password ─────────────────────────────────────────────────────
  FORGOT_PASSWORD_SAFE_MESSAGE: string;

  // ── Verify OTP ──────────────────────────────────────────────────────────
  OTP_VERIFIED: string;
  OTP_EXPIRED: string;

  // ── Reset password ──────────────────────────────────────────────────────
  PASSWORD_RESET_SUCCESS: string;
  INVALID_RESET_REQUEST: string;

  // ── Change password ─────────────────────────────────────────────────────
  PASSWORD_CHANGED: string;
  CURRENT_PASSWORD_INCORRECT: string;
  USER_NOT_FOUND: string;

  // ── Logout ──────────────────────────────────────────────────────────────
  LOGOUT_SUCCESS: string;

  // ── SMS OTP ─────────────────────────────────────────────────────────────
  SMS_OTP_SENT: string;
  SMS_OTP_FAILED: string;
  INVALID_PHONE_NUMBER: string;
}

/** All locale message maps. */
const AUTH_MESSAGES: Record<SupportedLang, AuthMessageMap> = {
  en: {
    REGISTRATION_SUCCESS:
      'Registration successful. Please verify your account.',
    EMAIL_ALREADY_REGISTERED: 'Email already registered',
    PHONE_ALREADY_REGISTERED: 'Phone number already registered',

    ACCOUNT_VERIFIED: 'Account verified successfully',
    INVALID_OR_EXPIRED_OTP: 'Invalid or expired OTP',
    ACCOUNT_ALREADY_VERIFIED: 'Account already verified',

    RESEND_OTP_SAFE_MESSAGE:
      'If your account is registered, a new OTP has been sent.',

    LOGIN_SUCCESS: 'Login successful',
    INVALID_CREDENTIALS: 'Invalid credentials',
    ACCOUNT_NOT_VERIFIED:
      'Account not verified. Please check your email or phone for the OTP.',

    FORGOT_PASSWORD_SAFE_MESSAGE:
      'If that email is registered, you will receive a reset OTP shortly.',

    OTP_VERIFIED: 'OTP verified successfully',
    OTP_EXPIRED: 'OTP has expired',

    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    INVALID_RESET_REQUEST: 'Invalid request',

    PASSWORD_CHANGED: 'Password changed successfully',
    CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
    USER_NOT_FOUND: 'User not found',

    LOGOUT_SUCCESS: 'Logged out successfully',

    SMS_OTP_SENT: 'OTP sent to your phone number.',
    SMS_OTP_FAILED: 'Failed to send OTP via SMS. Please try again.',
    INVALID_PHONE_NUMBER: 'Invalid phone number format',
  },

  bn: {
    REGISTRATION_SUCCESS:
      'নিবন্ধন সফল হয়েছে। অনুগ্রহ করে আপনার অ্যাকাউন্ট যাচাই করুন।',
    EMAIL_ALREADY_REGISTERED: 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত',
    PHONE_ALREADY_REGISTERED: 'এই ফোন নম্বরটি ইতিমধ্যে নিবন্ধিত',

    ACCOUNT_VERIFIED: 'অ্যাকাউন্ট সফলভাবে যাচাই করা হয়েছে',
    INVALID_OR_EXPIRED_OTP: 'ওটিপি অকার্যকর বা মেয়াদ শেষ হয়ে গেছে',
    ACCOUNT_ALREADY_VERIFIED: 'অ্যাকাউন্ট ইতিমধ্যে যাচাই করা হয়েছে',

    RESEND_OTP_SAFE_MESSAGE:
      'যদি আপনার অ্যাকাউন্ট নিবন্ধিত থাকে, তাহলে একটি নতুন ওটিপি পাঠানো হয়েছে।',

    LOGIN_SUCCESS: 'সফলভাবে লগইন হয়েছে',
    INVALID_CREDENTIALS: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়',
    ACCOUNT_NOT_VERIFIED:
      'অ্যাকাউন্ট যাচাই করা হয়নি। আপনার ইমেইল বা ফোনে ওটিপি পাঠানো হয়েছে।',

    FORGOT_PASSWORD_SAFE_MESSAGE:
      'যদি ইমেইলটি নিবন্ধিত থাকে, শীঘ্রই একটি রিসেট ওটিপি পাঠানো হবে।',

    OTP_VERIFIED: 'ওটিপি সফলভাবে যাচাই হয়েছে',
    OTP_EXPIRED: 'ওটিপির মেয়াদ শেষ হয়ে গেছে',

    PASSWORD_RESET_SUCCESS: 'পাসওয়ার্ড সফলভাবে পুনরায় সেট হয়েছে',
    INVALID_RESET_REQUEST: 'অনুরোধটি অকার্যকর',

    PASSWORD_CHANGED: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে',
    CURRENT_PASSWORD_INCORRECT: 'বর্তমান পাসওয়ার্ড সঠিক নয়',
    USER_NOT_FOUND: 'ব্যবহারকারী পাওয়া যায়নি',

    LOGOUT_SUCCESS: 'সফলভাবে লগআউট হয়েছে',

    SMS_OTP_SENT: 'আপনার ফোন নম্বরে ওটিপি পাঠানো হয়েছে।',
    SMS_OTP_FAILED:
      'এসএমএসের মাধ্যমে ওটিপি পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    INVALID_PHONE_NUMBER: 'ফোন নম্বরের ফরম্যাট অকার্যকর',
  },
};

/**
 * Resolve the locale from a raw `lang` header value.
 *
 * - Accepts `"en"`, `"bn"` (case-insensitive).
 * - Falls back to `"en"` for unknown or missing values.
 *
 * @param raw - Raw value from the `lang` request header.
 */
export function resolveLang(raw: string | undefined): SupportedLang {
  const normalised = (raw ?? '').toLowerCase().trim();
  if (normalised === 'bn') return 'bn';
  return 'en';
}

/**
 * Returns the full message map for the requested locale.
 *
 * @param lang - Resolved locale (use {@link resolveLang} to derive from header).
 */
export function getAuthMessages(lang: SupportedLang): AuthMessageMap {
  return AUTH_MESSAGES[lang];
}
