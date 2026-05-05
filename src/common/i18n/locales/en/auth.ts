/**
 * @fileoverview English locale — auth service messages.
 *
 * ── Authoring contract ───────────────────────────────────────────────────────
 *  - All values must be plain strings (`as const`).
 *  - Group keys by operation with a comment block.
 *  - Keys must exactly match {@link AuthMessageMap} in messages/auth.messages.ts.
 *  - To add a key: add here → add to bn/auth.ts → done. TypeScript enforces parity.
 *
 * @module i18n/locales/en/auth
 */
export const AUTH_EN = {
  // Register
  REGISTRATION_SUCCESS: 'Registration successful. Please verify your account.',
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  PHONE_ALREADY_REGISTERED: 'Phone number already registered',

  // Verify account
  ACCOUNT_VERIFIED: 'Account verified successfully',
  INVALID_OR_EXPIRED_OTP: 'Invalid or expired OTP',
  ACCOUNT_ALREADY_VERIFIED: 'Account already verified',

  // Resend verification
  RESEND_OTP_SAFE_MESSAGE:
    'If your account is registered, a new OTP has been sent.',

  // Login
  LOGIN_SUCCESS: 'Login successful',
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_NOT_VERIFIED:
    'Account not verified. Please check your email or phone for the OTP.',

  // Forgot password
  FORGOT_PASSWORD_SAFE_MESSAGE:
    'If that email is registered, you will receive a reset OTP shortly.',

  // Verify OTP
  OTP_VERIFIED: 'OTP verified successfully',
  OTP_EXPIRED: 'OTP has expired',

  // Reset password
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  INVALID_RESET_REQUEST: 'Invalid request',

  // Change password
  PASSWORD_CHANGED: 'Password changed successfully',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  USER_NOT_FOUND: 'User not found',

  // Logout
  LOGOUT_SUCCESS: 'Logged out successfully',

  // SMS OTP
  SMS_OTP_SENT: 'OTP sent to your phone number.',
  SMS_OTP_FAILED: 'Failed to send OTP via SMS. Please try again.',
  INVALID_PHONE_NUMBER: 'Invalid phone number format',
} as const;
