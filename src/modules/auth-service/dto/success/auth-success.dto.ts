/**
 * @fileoverview Swagger success-response DTOs for Auth endpoints.
 *
 * All `message` @ApiProperty examples document both EN and BN values because
 * the actual runtime message is localised based on the `lang` request header.
 *
 * Format used in descriptions:
 *   EN: "<english text>" | BN: "<bengali text>"
 */
import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Methods } from 'src/common/enum/methods.enum';
import type { LoginResponseDto } from '../../interfaces/auth.interface';

// ─── Register ────────────────────────────────────────────────────────────────

export class RegisterSuccessResponseDto extends SuccessResponseDto<null> {
  @ApiProperty({
    example: 'Registration successful. Please verify your account.',
    description:
      'EN: "Registration successful. Please verify your account." | ' +
      'BN: "নিবন্ধন সফল হয়েছে। অনুগ্রহ করে আপনার অ্যাকাউন্ট যাচাই করুন।"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/register' })
  declare endpoint: string;

  @ApiProperty({ example: 201 })
  declare statusCode: number;

  @ApiProperty({ example: null })
  declare data: null;
}

// ─── Verify account ───────────────────────────────────────────────────────────

export class VerifyAccountSuccessResponseDto extends SuccessResponseDto<null> {
  @ApiProperty({
    example: 'Account verified successfully',
    description:
      'EN: "Account verified successfully" | ' +
      'BN: "অ্যাকাউন্ট সফলভাবে যাচাই করা হয়েছে"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/verify-account' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

// ─── Resend verification email ────────────────────────────────────────────────

export class ResendVerificationEmailSuccessResponseDto extends SuccessResponseDto<null> {
  @ApiProperty({
    example: 'If your account is registered, a new OTP has been sent.',
    description:
      'EN: "If your account is registered, a new OTP has been sent." | ' +
      'BN: "যদি আপনার অ্যাকাউন্ট নিবন্ধিত থাকে, তাহলে একটি নতুন ওটিপি পাঠানো হয়েছে।"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/resend-verification-email' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export class LoginSuccessResponseDto extends SuccessResponseDto<LoginResponseDto> {
  @ApiProperty({
    example: 'Login successful',
    description: 'EN: "Login successful" | ' + 'BN: "সফলভাবে লগইন হয়েছে"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/login' })
  declare endpoint: string;

  @ApiProperty({
    example: {
      access_token: '69b8bba8-f2e6-bd15-2e34-b0f1a1234567:c7f3e91a-4b2d-4e8f-9a1c-3d5f7b2e6a04',
      user: {
        sub: '60d0fe4f-5311-2361-68a1-09ca12345678',
        email: 'user@example.com',
        fullName: 'John Doe',
        role: 'CUSTOMER',
      },
    },
  })
  declare data: LoginResponseDto;
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export class ForgetPasswordSuccessResponseDto extends SuccessResponseDto<null> {
  @ApiProperty({
    example:
      'If that email is registered, you will receive a reset OTP shortly.',
    description:
      'EN: "If that email is registered, you will receive a reset OTP shortly." | ' +
      'BN: "যদি ইমেইলটি নিবন্ধিত থাকে, শীঘ্রই একটি রিসেট ওটিপি পাঠানো হবে।"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/forgot-password' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export class VerifyOtpSuccessResponseDto extends SuccessResponseDto<null> {
  @ApiProperty({
    example: 'OTP verified successfully',
    description:
      'EN: "OTP verified successfully" | ' + 'BN: "ওটিপি সফলভাবে যাচাই হয়েছে"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/forget-password-verify-otp' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

// ─── Reset password ───────────────────────────────────────────────────────────

export class ResetPasswordSuccessResponseDto extends SuccessResponseDto<null> {
  @ApiProperty({
    example: 'Password reset successfully',
    description:
      'EN: "Password reset successfully" | ' +
      'BN: "পাসওয়ার্ড সফলভাবে পুনরায় সেট হয়েছে"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/reset-password' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

// ─── Change password ──────────────────────────────────────────────────────────

export class ChangePasswordSuccessResponseDto extends SuccessResponseDto<null> {
  @ApiProperty({
    example: 'Password changed successfully',
    description:
      'EN: "Password changed successfully" | ' +
      'BN: "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/change-password' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export class LogoutSuccessResponseDto extends SuccessResponseDto<null> {
  @ApiProperty({
    example: 'Logged out successfully',
    description:
      'EN: "Logged out successfully" | ' + 'BN: "সফলভাবে লগআউট হয়েছে"',
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/logout' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}
