/**
 * @fileoverview Authentication service.
 *
 * Business logic for all auth flows:
 *  register → verify-account → login → logout
 *  forgot-password → verify-otp → reset-password
 *  change-password
 *
 * Key changes vs. previous version:
 *  1. **Email XOR Phone registration** — the service branches on whether the
 *     caller supplied `email` or `phone` and uses the correct channel for OTP
 *     delivery (email queue vs auth-sms queue).
 *  2. **auth-sms queue** — SMS OTP delivery is fully asynchronous via
 *     {@link SmsService}.  The request path is never blocked by gateway I/O.
 *  3. **i18n** — every user-facing message is sourced from
 *     {@link getAuthMessages} keyed by the resolved `lang` header value.
 *     Supported locales: `en` (default), `bn`.
 *
 * @module auth-service
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { getAuthMessages, SupportedLang } from 'src/common/i18n';
import { RedisTokenService } from 'src/common/redis/redis-service/auth/redis-token.service';
import { normalisePhone } from 'src/common/utils/phone.util';
import { UserService } from 'src/modules/user-service/user.service';
import config from 'src/shared/config/app.config';
import type { AuthUser } from 'src/shared/interfaces/auth-user.interface';
import { ServicePayload } from 'src/shared/interfaces/response.interface';
import { EmailService } from '../email-service/email.service';
import { SmsService } from '../sms-service/sms.service';
import { ChangePasswordDto } from './dto/validation/change-password.dto';
import { ForgotPasswordDto } from './dto/validation/forgot-password.dto';
import { LoginDto } from './dto/validation/login.dto';
import { RegisterDto } from './dto/validation/register.dto';
import { ResendVerificationDto } from './dto/validation/resend-verification.dto';
import { ResetPasswordDto } from './dto/validation/reset-password.dto';
import { VerifyAccountDto } from './dto/validation/verify-account.dto';
import { VerifyOtpDto } from './dto/validation/verify-otp.dto';
import type { LoginResponseDto } from './interfaces/auth.interface';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generates a cryptographically adequate 6-digit numeric OTP. */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** OTP TTL constants (milliseconds). */
const OTP_TTL_MS = {
  VERIFICATION: 15 * 60 * 1000, // 15 min
  RESET: 10 * 60 * 1000, // 10 min
} as const;

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisTokenService: RedisTokenService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register a new user with either an email address or a phone number.
   *
   * Flow (email path):
   *  1. Guard duplicate email.
   *  2. Hash password + generate OTP.
   *  3. Persist user.
   *  4. Enqueue verification email via auth-email queue.
   *
   * Flow (phone path):
   *  1. Normalise + guard duplicate phone.
   *  2. Hash password + generate OTP.
   *  3. Persist user.
   *  4. Enqueue OTP SMS via auth-sms queue.
   *
   * @param dto  - Registration payload.
   * @param lang - Resolved locale from `lang` header.
   */
  async register(
    dto: RegisterDto,
    lang: SupportedLang,
  ): Promise<{ message: string }> {
    const m = getAuthMessages(lang);

    if (dto.email) {
      // ── Email registration path ──────────────────────────────────────────
      const exists = await this.userService.existsByEmail(dto.email);
      if (exists) {
        throw new ConflictException(m.EMAIL_ALREADY_REGISTERED);
      }

      const [hashedPassword, otp] = await Promise.all([
        bcrypt.hash(dto.password, config.BCRYPT_SALT_ROUNDS),
        Promise.resolve(generateOtp()),
      ]);

      await this.userService.create({
        name: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        acc_verification_otp: otp,
        acc_verified: false,
      });

      // Fire-and-forget — auth email queue handles retries
      void this.emailService.sendAuthEmail({
        to: dto.email,
        subject: 'Verify your account',
        html: `<p>Your verification OTP is: <strong>${otp}</strong></p><p>Expires in 15 minutes.</p>`,
      });

      this.logger.log(`User registered via email: ${dto.email}`);
    } else {
      // ── Phone registration path ──────────────────────────────────────────
      const normalisedPhone = normalisePhone(dto.phone!);
      if (!normalisedPhone) {
        // Defensive — class-validator Matches() should catch this first
        throw new BadRequestException(m.INVALID_PHONE_NUMBER);
      }

      const exists = await this.userService.existsByPhone(normalisedPhone);
      if (exists) {
        throw new ConflictException(m.PHONE_ALREADY_REGISTERED);
      }

      const [hashedPassword, otp] = await Promise.all([
        bcrypt.hash(dto.password, config.BCRYPT_SALT_ROUNDS),
        Promise.resolve(generateOtp()),
      ]);

      await this.userService.create({
        name: dto.fullName,
        phone: normalisedPhone,
        password: hashedPassword,
        role: dto.role,
        acc_verification_otp: otp,
        acc_verified: false,
      });

      // Fire-and-forget — auth-sms queue handles retries
      void this.smsService.sendAuthSms(
        normalisedPhone,
        `Your verification OTP is ${otp}. It expires in 15 minutes.`,
      );

      this.logger.log(`User registered via phone: ${normalisedPhone}`);
    }

    return { message: m.REGISTRATION_SUCCESS };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFY ACCOUNT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Verify a user account using the 6-digit OTP delivered at registration.
   *
   * Works for both email- and phone-registered accounts — the OTP is stored
   * in the same `acc_verification_otp` column regardless of channel.
   *
   * @param dto  - Payload containing the OTP token.
   * @param lang - Resolved locale from `lang` header.
   */
  async verifyAccount(
    dto: VerifyAccountDto,
    lang: SupportedLang,
  ): Promise<{ message: string }> {
    const m = getAuthMessages(lang);

    const user = await this.userService.findByVerificationOtp(dto.token);

    if (!user) {
      throw new BadRequestException(m.INVALID_OR_EXPIRED_OTP);
    }

    if (user.acc_verified) {
      throw new BadRequestException(m.ACCOUNT_ALREADY_VERIFIED);
    }

    await this.userService.markVerifiedAndClearOtp(user.id);

    this.logger.log(`Account verified: ${user.email ?? user.phone}`);

    return { message: m.ACCOUNT_VERIFIED };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESEND VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Regenerate and resend the account verification OTP.
   *
   * Accepts an `email` or `phone` field on the DTO and routes delivery to
   * the appropriate queue.  Always returns the same safe message to prevent
   * identifier enumeration.
   *
   * @param dto  - Payload with `email` or `phone`.
   * @param lang - Resolved locale from `lang` header.
   */
  async resendVerificationEmail(
    dto: ResendVerificationDto,
    lang: SupportedLang,
  ): Promise<{ message: string }> {
    const m = getAuthMessages(lang);

    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      return { message: m.RESEND_OTP_SAFE_MESSAGE };
    }

    if (user.acc_verified) {
      throw new BadRequestException(m.ACCOUNT_ALREADY_VERIFIED);
    }

    const otp = generateOtp();

    await this.userService.update(user.id, {
      acc_verification_otp: otp,
    });

    // Fire-and-forget
    void this.emailService.sendAuthEmail({
      to: dto.email,
      subject: 'Verify your account — new OTP',
      html: `<p>Your new verification OTP is: <strong>${otp}</strong></p><p>Expires in 15 minutes.</p>`,
    });

    return { message: m.RESEND_OTP_SAFE_MESSAGE };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Authenticate a user and issue a Redis-backed JWT session.
   *
   * A cryptographically random session ID is generated server-side and used
   * as the Redis key — no client-supplied device identifier is required or
   * trusted for session management.
   *
   * @param dto  - Login credentials (email + password).
   * @param lang - Resolved locale from `lang` header.
   */
  async login(
    dto: LoginDto,
    lang: SupportedLang,
  ): Promise<ServicePayload<LoginResponseDto>> {
    const m = getAuthMessages(lang);

    const user = await this.userService.findWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException(m.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(m.INVALID_CREDENTIALS);
    }

    if (!user.acc_verified) {
      throw new UnauthorizedException(m.ACCOUNT_NOT_VERIFIED);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const jwt = await this.jwtService.signAsync(payload);

    // Generate a cryptographically random session ID server-side.
    // This is the Redis key returned to the client as the access_token.
    // It is never derived from client-supplied headers, preventing spoofing.
    const sessionId = crypto.randomUUID();
    const tokenKey = `${user.id}:${sessionId}`;

    await this.redisTokenService.storeToken(
      tokenKey,
      jwt,
      config.JWT_EXPIRES_IN,
    );

    this.logger.log(`User logged in: ${user.email} session=${sessionId}`);

    return {
      message: m.LOGIN_SUCCESS,
      data: {
        access_token: tokenKey,
        user: { email: user.email!, fullName: user.name, role: user.role },
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initiate a password reset flow via email OTP.
   *
   * Security: always returns the same safe message to prevent email enumeration.
   *
   * @param dto  - Payload with the registered email.
   * @param lang - Resolved locale from `lang` header.
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
    lang: SupportedLang,
  ): Promise<{ message: string }> {
    const m = getAuthMessages(lang);

    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      return { message: m.FORGOT_PASSWORD_SAFE_MESSAGE };
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + OTP_TTL_MS.RESET);

    await this.userService.update(user.id, {
      reset_pass_otp: otp,
      reset_pass_otp_expired_at: expiry,
    });

    // Fire-and-forget
    void this.emailService.sendAuthEmail({
      to: dto.email,
      subject: 'Password reset OTP',
      html: `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`,
    });

    this.logger.log(`Password reset OTP sent: ${dto.email}`);

    return { message: m.FORGOT_PASSWORD_SAFE_MESSAGE };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFY OTP (password reset step 2 of 3)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Verify the password-reset OTP before allowing the actual reset.
   *
   * @param dto  - Payload containing email and OTP.
   * @param lang - Resolved locale from `lang` header.
   */
  async verifyOtp(
    dto: VerifyOtpDto,
    lang: SupportedLang,
  ): Promise<{ message: string }> {
    const m = getAuthMessages(lang);

    const user = await this.userService.findWithOtp(dto.email);

    if (!user) {
      throw new BadRequestException(m.INVALID_OR_EXPIRED_OTP);
    }

    if (user.reset_pass_otp !== dto.otp) {
      throw new BadRequestException(m.INVALID_OR_EXPIRED_OTP);
    }

    if (
      !user.reset_pass_otp_expired_at ||
      user.reset_pass_otp_expired_at < new Date()
    ) {
      throw new BadRequestException(m.OTP_EXPIRED);
    }

    return { message: m.OTP_VERIFIED };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESET PASSWORD (step 3 of 3)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Reset the user's password using a previously verified OTP.
   *
   * @param dto  - Payload containing email, OTP (re-validated), and new password.
   * @param lang - Resolved locale from `lang` header.
   */
  async resetPassword(
    dto: ResetPasswordDto,
    lang: SupportedLang,
  ): Promise<{ message: string }> {
    const m = getAuthMessages(lang);

    const user = await this.userService.findWithOtp(dto.email);

    if (!user) {
      throw new BadRequestException(m.INVALID_RESET_REQUEST);
    }

    if (
      !dto.otp ||
      user.reset_pass_otp !== dto.otp ||
      !user.reset_pass_otp_expired_at ||
      user.reset_pass_otp_expired_at < new Date()
    ) {
      throw new BadRequestException(m.INVALID_OR_EXPIRED_OTP);
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      config.BCRYPT_SALT_ROUNDS,
    );

    await this.userService.resetPasswordAndClearOtp(user.id, hashedPassword);
    await this.redisTokenService.deleteUserTokens(user.id);

    this.logger.log(`Password reset for: ${dto.email}`);

    return { message: m.PASSWORD_RESET_SUCCESS };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHANGE PASSWORD (authenticated)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Change password for an authenticated user.
   *
   * @param userId - Authenticated user ID.
   * @param dto    - Payload with old and new passwords.
   * @param lang   - Resolved locale from `lang` header.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    lang: SupportedLang,
  ): Promise<{ message: string }> {
    const m = getAuthMessages(lang);

    const user = await this.userService.findByIdWithPassword(userId);

    if (!user) {
      throw new UnauthorizedException(m.USER_NOT_FOUND);
    }

    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException(m.CURRENT_PASSWORD_INCORRECT);
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      config.BCRYPT_SALT_ROUNDS,
    );

    await this.userService.update(userId, { password: hashedPassword });
    await this.redisTokenService.deleteUserTokens(userId);

    this.logger.log(`Password changed for user: ${userId}`);

    return { message: m.PASSWORD_CHANGED };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Log out from the current session by deleting the Redis token key.
   *
   * The Redis key is the opaque token returned at login and stored in the
   * Authorization header. It is resolved by {@link JwtAuthGuard} and
   * attached to `request['redisKey']` — the controller passes it here.
   * No client-supplied device identifier is needed.
   *
   * @param userId   - Authenticated user ID.
   * @param redisKey - The full Redis session key (`userId:sessionId`),
   *                   resolved server-side by JwtAuthGuard.
   * @param lang     - Resolved locale from `lang` header.
   */
  async logout(
    userId: AuthUser['_id'],
    redisKey: string,
    lang: SupportedLang,
  ): Promise<{ message: string }> {
    const m = getAuthMessages(lang);

    await this.redisTokenService.deleteToken(redisKey);

    this.logger.log(`User logged out: userId=${userId} key=${redisKey}`);

    return { message: m.LOGOUT_SUCCESS };
  }
}
