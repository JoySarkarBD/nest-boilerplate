/**
 * @fileoverview Swagger DTOs for 429 Throttling Error responses in the Auth module.
 *
 * The `message` and `error` fields reflect localised runtime output.
 * The actual value depends on the `lang` request header (`en` | `bn`):
 *
 *   EN: "Too many requests. Please try again later."
 *   BN: "অনেক বেশি অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।"
 */
import { ApiProperty } from '@nestjs/swagger';
import { CustomTooManyRequestsDto } from 'src/common/dto/custom-throttler.dto';
import { Methods } from 'src/common/enum/methods.enum';

const THROTTLE_MSG_DESC =
  'Localised throttle message. ' +
  'EN: "Too many requests. Please try again later." | ' +
  'BN: "অনেক বেশি অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।"';

const THROTTLE_MSG_EXAMPLE = 'Too many requests. Please try again later.';

// ─── Per-endpoint throttle DTOs ───────────────────────────────────────────────

export class RegisterThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/register' })
  declare endpoint: string;

  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare error: string;
}

export class LoginThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/login' })
  declare endpoint: string;

  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare error: string;
}

export class ForgotPasswordThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/forgot-password' })
  declare endpoint: string;

  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare error: string;
}

export class VerifyOtpThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/forget-password-verify-otp' })
  declare endpoint: string;

  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare error: string;
}

export class ResetPasswordThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/reset-password' })
  declare endpoint: string;

  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare error: string;
}

export class ChangePasswordThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/change-password' })
  declare endpoint: string;

  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare error: string;
}

export class ResendVerificationEmailThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/resend-verification-email' })
  declare endpoint: string;

  @ApiProperty({
    example: THROTTLE_MSG_EXAMPLE,
    description: THROTTLE_MSG_DESC,
  })
  declare error: string;
}
