/**
 * @fileoverview Auth throttle constants — re-export shim.
 *
 * All throttle values are now defined in and sourced from
 * `../config/throttle.config`. This file is kept only for
 * backward-compatibility with any external import paths.
 *
 * @deprecated Import directly from `../config/throttle.config`.
 */
export {
  LOGIN,
  LOGIN_EMAIL,
  REGISTER,
  REGISTER_EMAIL,
  REGISTER_PHONE,
  RESEND_VERIFICATION_EMAIL,
  RESEND_VERIFICATION_EMAIL_IDENTITY,
  FORGOT_PASSWORD,
  FORGOT_PASSWORD_EMAIL,
  VERIFY_OTP,
  VERIFY_OTP_EMAIL,
  RESET_PASSWORD,
  RESET_PASSWORD_EMAIL,
  CHANGE_PASSWORD,
  AUTHENTICATED_USER,
} from '../config/throttle.config';
