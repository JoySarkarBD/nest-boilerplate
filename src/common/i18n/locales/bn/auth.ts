/**
 * @fileoverview Bengali locale — auth service messages.
 *
 * Keys must exactly match {@link AuthMessageMap} in messages/auth.messages.ts.
 * TypeScript enforces this at compile time — you cannot have a missing or extra key.
 *
 * @module i18n/locales/bn/auth
 */
export const AUTH_BN = {
  // Register
  REGISTRATION_SUCCESS:
    'নিবন্ধন সফল হয়েছে। অনুগ্রহ করে আপনার অ্যাকাউন্ট যাচাই করুন।',
  EMAIL_ALREADY_REGISTERED: 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত',
  PHONE_ALREADY_REGISTERED: 'এই ফোন নম্বরটি ইতিমধ্যে নিবন্ধিত',

  // Verify account
  ACCOUNT_VERIFIED: 'অ্যাকাউন্ট সফলভাবে যাচাই করা হয়েছে',
  INVALID_OR_EXPIRED_OTP: 'ওটিপি অকার্যকর বা মেয়াদ শেষ হয়ে গেছে',
  ACCOUNT_ALREADY_VERIFIED: 'অ্যাকাউন্ট ইতিমধ্যে যাচাই করা হয়েছে',

  // Resend verification
  RESEND_OTP_SAFE_MESSAGE:
    'যদি আপনার অ্যাকাউন্ট নিবন্ধিত থাকে, তাহলে একটি নতুন ওটিপি পাঠানো হয়েছে।',

  // Login
  LOGIN_SUCCESS: 'সফলভাবে লগইন হয়েছে',
  INVALID_CREDENTIALS: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়',
  ACCOUNT_NOT_VERIFIED:
    'অ্যাকাউন্ট যাচাই করা হয়নি। আপনার ইমেইল বা ফোনে ওটিপি পাঠানো হয়েছে।',

  // Forgot password
  FORGOT_PASSWORD_SAFE_MESSAGE:
    'যদি ইমেইলটি নিবন্ধিত থাকে, শীঘ্রই একটি রিসেট ওটিপি পাঠানো হবে।',

  // Verify OTP
  OTP_VERIFIED: 'ওটিপি সফলভাবে যাচাই হয়েছে',
  OTP_EXPIRED: 'ওটিপির মেয়াদ শেষ হয়ে গেছে',

  // Reset password
  PASSWORD_RESET_SUCCESS: 'পাসওয়ার্ড সফলভাবে পুনরায় সেট হয়েছে',
  INVALID_RESET_REQUEST: 'অনুরোধটি অকার্যকর',

  // Change password
  PASSWORD_CHANGED: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে',
  CURRENT_PASSWORD_INCORRECT: 'বর্তমান পাসওয়ার্ড সঠিক নয়',
  USER_NOT_FOUND: 'ব্যবহারকারী পাওয়া যায়নি',

  // Logout
  LOGOUT_SUCCESS: 'সফলভাবে লগআউট হয়েছে',

  // SMS OTP
  SMS_OTP_SENT: 'আপনার ফোন নম্বরে ওটিপি পাঠানো হয়েছে।',
  SMS_OTP_FAILED:
    'এসএমএসের মাধ্যমে ওটিপি পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
  INVALID_PHONE_NUMBER: 'ফোন নম্বরের ফরম্যাট অকার্যকর',
} as const;
