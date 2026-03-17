/*
 * @fileoverview Swagger DTOs for 429 Throttling Error responses in the Auth module.
 * This file defines the structure of the response returned when a user exceeds the allowed rate limit for authentication-related endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';
import { CustomTooManyRequestsDto } from 'src/common/dto/custom-throttler.dto';
import { Methods } from 'src/common/enum/methods.enum';

/** DTO for the response returned when a user exceeds the allowed rate limit for registration. */
export class RegisterThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/register' })
  declare endpoint: string;

  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare error: string;
}

/** DTO for the response returned when a user exceeds the allowed rate limit for login. */
export class LoginThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/login' })
  declare endpoint: string;

  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare error: string;
}

/** DTO for the response returned when a user exceeds the allowed rate limit for forgot password. */
export class ForgotPasswordThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/forgot-password' })
  declare endpoint: string;

  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare error: string;
}

/** DTO for the response returned when a user exceeds the allowed rate limit for verify OTP. */
export class VerifyOtpThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/verify-otp' })
  declare endpoint: string;

  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare error: string;
}

/** DTO for the response returned when a user exceeds the allowed rate limit for reset password. */
export class ResetPasswordThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/reset-password' })
  declare endpoint: string;

  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare error: string;
}

/** DTO for the response returned when a user exceeds the allowed rate limit for change password. */
export class ChangePasswordThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/change-password' })
  declare endpoint: string;

  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare error: string;
}

/** DTO for the response returned when a user exceeds the allowed rate limit for resend verification email. */
export class ResendVerificationEmailThrottleResponseDto extends CustomTooManyRequestsDto {
  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/resend-verification-email' })
  declare endpoint: string;

  @ApiProperty({ example: 'Too many requests. Try again later.' })
  declare error: string;
}
