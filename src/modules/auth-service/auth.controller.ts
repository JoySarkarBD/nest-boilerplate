/**
 * @fileoverview Authentication controller.
 *
 * Thin HTTP delegation layer — all business logic lives in {@link AuthService}.
 *
 * ── Throttle guard strategy ───────────────────────────────────────────────────
 *
 * All throttle guards use the new multi-layer sliding-window algorithm:
 *  - IP layer:      hybrid key (IP + UA hash + optional device-id)
 *  - Identity layer: email / phone / userId extracted from request
 *
 * Guards are disabled in NODE_ENV !== 'production' to allow dev/test freedom.
 * Set NODE_ENV=production (or override env) in staging to enable full protection.
 *
 * ── Authenticated endpoints ───────────────────────────────────────────────────
 *
 * change-password and logout run behind JwtAuthGuard. The ChangePasswordThrottleGuard
 * additionally enforces a userId-scoped limit (placed after JwtAuthGuard so
 * request.user is available).
 *
 * The AuthenticatedUserThrottleGuard is exported from AuthModule for use on any
 * route in the application that requires per-user rate limiting post-login.
 *
 * @module auth-service
 */
import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from 'src/common/decorators/api-error-response.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { resolveLang } from 'src/common/i18n';
import { ChangePasswordThrottleGuard } from 'src/common/throttles/auth/change-password-throttle.guard';
import { ForgotPasswordThrottleGuard } from 'src/common/throttles/auth/forgot-password-throttle.guard';
import { LoginThrottleGuard } from 'src/common/throttles/auth/login-throttle.guard';
import { RegisterThrottleGuard } from 'src/common/throttles/auth/register-throttle.guard';
import { ResendVerificationEmailThrottleGuard } from 'src/common/throttles/auth/resend-verification-email-throttle.guard';
import { ResetPasswordThrottleGuard } from 'src/common/throttles/auth/reset-password-throttle.guard';
import { VerifyOtpThrottleGuard } from 'src/common/throttles/auth/verify-otp-throttle.guard';
import config from 'src/shared/config/app.config';
import type { AuthUser } from 'src/shared/interfaces/auth-user.interface';
import type { ServicePayload } from 'src/shared/interfaces/response.interface';
import { AuthService } from './auth.service';
import {
  ChangePasswordThrottleResponseDto,
  ForgotPasswordThrottleResponseDto,
  LoginThrottleResponseDto,
  RegisterThrottleResponseDto,
  ResendVerificationEmailThrottleResponseDto,
  ResetPasswordThrottleResponseDto,
  VerifyOtpThrottleResponseDto,
} from './dto/error/auth-throttler.dto';
import {
  ChangePasswordValidationErrorResponseDto,
  ForgotPasswordValidationErrorResponseDto,
  LoginValidationErrorResponseDto,
  RegisterValidationErrorResponseDto,
  ResendVerificationEmailValidationErrorResponseDto,
  ResetPasswordValidationErrorResponseDto,
  VerifyAccountValidationErrorResponseDto,
  VerifyOtpValidationErrorResponseDto,
} from './dto/error/auth-validation-error.dto';
import {
  ChangePasswordSuccessResponseDto,
  ForgetPasswordSuccessResponseDto,
  LoginSuccessResponseDto,
  LogoutSuccessResponseDto,
  RegisterSuccessResponseDto,
  ResendVerificationEmailSuccessResponseDto,
  ResetPasswordSuccessResponseDto,
  VerifyAccountSuccessResponseDto,
  VerifyOtpSuccessResponseDto,
} from './dto/success/auth-success.dto';
import { ChangePasswordDto } from './dto/validation/change-password.dto';
import { ForgotPasswordDto } from './dto/validation/forgot-password.dto';
import { LoginDto } from './dto/validation/login.dto';
import { RegisterDto } from './dto/validation/register.dto';
import { ResendVerificationDto } from './dto/validation/resend-verification.dto';
import { ResetPasswordDto } from './dto/validation/reset-password.dto';
import { VerifyAccountDto } from './dto/validation/verify-account.dto';
import { VerifyOtpDto } from './dto/validation/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { LoginResponseDto } from './interfaces/auth.interface';

/** Whether throttling is active. Disable only in development/test. */
const THROTTLE_ENABLED = config.NODE_ENV === 'production';

/** Shared lang header definition re-used across all endpoints. */
const LANG_HEADER = {
  name: 'lang',
  description: 'Response language. Supported values: `en` (default), `bn`.',
  required: false,
  example: 'en',
};

/**
 * REST controller for all authentication-related endpoints.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register a new user account using either an email address or a phone number.
   *
   * Throttled by:
   *  - IP + UA + optional device-id (per-client limit)
   *  - Email identity (prevents multi-IP spray on same email)
   *  - Phone identity (prevents multi-IP spray on same phone)
   */
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Accepts **either** `email` or `phone` — not both and not neither. ' +
      'An OTP is sent via email (email path) or SMS (phone path).',
  })
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(RegisterSuccessResponseDto, 201)
  @ApiErrorResponses({
    throttle: RegisterThrottleResponseDto,
    validation: RegisterValidationErrorResponseDto,
  })
  @UseGuards(...(THROTTLE_ENABLED ? [RegisterThrottleGuard] : []))
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Headers('lang') lang: string | undefined,
  ) {
    return this.authService.register(dto, resolveLang(lang));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFY ACCOUNT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Verify an account using the 6-digit OTP delivered at registration.
   */
  @ApiOperation({ summary: 'Verify account with OTP' })
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(VerifyAccountSuccessResponseDto, 200)
  @ApiErrorResponses({
    validation: VerifyAccountValidationErrorResponseDto,
  })
  @Post('verify-account')
  async verifyAccount(
    @Body() dto: VerifyAccountDto,
    @Headers('lang') lang: string | undefined,
  ) {
    return this.authService.verifyAccount(dto, resolveLang(lang));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESEND VERIFICATION EMAIL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resend the account verification OTP.
   *
   * Throttled by:
   *  - IP + UA + optional device-id
   *  - Email identity
   */
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(ResendVerificationEmailSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: ResendVerificationEmailThrottleResponseDto,
    validation: ResendVerificationEmailValidationErrorResponseDto,
  })
  @UseGuards(
    ...(THROTTLE_ENABLED ? [ResendVerificationEmailThrottleGuard] : []),
  )
  @Post('resend-verification-email')
  async resendVerificationEmail(
    @Body() dto: ResendVerificationDto,
    @Headers('lang') lang: string | undefined,
  ) {
    return this.authService.resendVerificationEmail(dto, resolveLang(lang));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Authenticate a user and issue a Redis-backed JWT session.
   *
   * Throttled by:
   *  - IP + UA + optional device-id (anti-brute-force per client)
   *  - Email identity (anti-multi-IP spray on one account)
   *
   * Returns an opaque `access_token` (Redis session key) used as Bearer token.
   */
  @ApiOperation({ summary: 'Login user' })
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(LoginSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: LoginThrottleResponseDto,
    validation: LoginValidationErrorResponseDto,
  })
  @UseGuards(...(THROTTLE_ENABLED ? [LoginThrottleGuard] : []))
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers('lang') lang: string | undefined,
  ): Promise<ServicePayload<LoginResponseDto>> {
    return this.authService.login(dto, resolveLang(lang));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initiate the forgot-password flow (step 1 of 3).
   *
   * Throttled by:
   *  - IP + UA + optional device-id (strict — OTP issuance is expensive)
   *  - Email identity (anti-multi-IP spray)
   */
  @ApiOperation({ summary: 'Forgot password request' })
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(ForgetPasswordSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: ForgotPasswordThrottleResponseDto,
    validation: ForgotPasswordValidationErrorResponseDto,
  })
  @UseGuards(
    ...(THROTTLE_ENABLED ? [ForgotPasswordThrottleGuard] : []),
  )
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Headers('lang') lang: string | undefined,
  ) {
    return this.authService.forgotPassword(dto, resolveLang(lang));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFY OTP
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Verify the password-reset OTP (step 2 of 3).
   *
   * Throttled by:
   *  - IP + UA + optional device-id (strictest — 6-digit OTP brute-force risk)
   *  - Email identity (combined per-email limit)
   */
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(VerifyOtpSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: VerifyOtpThrottleResponseDto,
    validation: VerifyOtpValidationErrorResponseDto,
  })
  @UseGuards(...(THROTTLE_ENABLED ? [VerifyOtpThrottleGuard] : []))
  @Post('forget-password-verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Headers('lang') lang: string | undefined,
  ) {
    return this.authService.verifyOtp(dto, resolveLang(lang));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESET PASSWORD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Reset the user's password (step 3 of 3).
   *
   * Throttled by:
   *  - IP + UA + optional device-id
   *  - Email identity
   */
  @ApiOperation({ summary: 'Reset password' })
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(ResetPasswordSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: ResetPasswordThrottleResponseDto,
    validation: ResetPasswordValidationErrorResponseDto,
  })
  @UseGuards(
    ...(THROTTLE_ENABLED ? [ResetPasswordThrottleGuard] : []),
  )
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Headers('lang') lang: string | undefined,
  ) {
    return this.authService.resetPassword(dto, resolveLang(lang));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHANGE PASSWORD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Change password for an authenticated user.
   *
   * Throttled by:
   *  - Authenticated userId (primary — IP-rotation proof)
   *  - IP + UA + optional device-id (secondary — defence-in-depth)
   *
   * JwtAuthGuard must run before ChangePasswordThrottleGuard so userId is available.
   */
  @ApiOperation({ summary: 'Change password (authenticated)' })
  @ApiBearerAuth('Authorization')
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(ChangePasswordSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: ChangePasswordThrottleResponseDto,
    validation: ChangePasswordValidationErrorResponseDto,
  })
  @UseGuards(
    JwtAuthGuard,
    ...(THROTTLE_ENABLED ? [ChangePasswordThrottleGuard] : []),
  )
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Headers('lang') lang: string | undefined,
  ) {
    return this.authService.changePassword(user._id!, dto, resolveLang(lang));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Log out the current session.
   *
   * The Redis session key is resolved from the Authorization header by
   * JwtAuthGuard and attached to `request['redisKey']`.
   */
  @ApiOperation({ summary: 'Logout (authenticated)' })
  @ApiBearerAuth('Authorization')
  @ApiHeader(LANG_HEADER)
  @ApiSuccessResponse(LogoutSuccessResponseDto, 200)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthUser,
    @Req() req: any,
    @Headers('lang') lang: string | undefined,
  ) {
    const redisKey: string = req['redisKey'];
    return this.authService.logout(user._id, redisKey, resolveLang(lang));
  }
}
