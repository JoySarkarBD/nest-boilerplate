/**
 * @fileoverview Swagger DTOs for 400 Validation Error responses.
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  FieldErrorDto,
  ValidationErrorResponseDto,
} from 'src/common/dto/validation-error.dto';
import { Methods } from 'src/common/enum/methods.enum';
import { UserRole } from 'src/user/schemas/user.schema';
import { Platform } from '../forgot-password.dto';

/**
 * Represents a 400 Bad Request response specifically for register validation failures.
 * This DTO includes an array of `FieldErrorDto` to pinpoint multiple validation issues.
 */
export class RegisterValidationErrorResponseDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/register' })
  declare endpoint: string;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [
      {
        field: 'fullName',
        message: 'fullName must be a string',
      },
      {
        field: 'email',
        message: 'email must be a valid email address',
      },
      {
        field: 'password',
        message: 'password must be at least 8 characters',
      },
      {
        field: 'role',
        message: `role must be one of ${Object.values(UserRole).join(', ')}`,
      },
    ],
  })
  declare errors: FieldErrorDto[];
}

/** 400 Validation Error for Verify Account endpoint. */
export class VerifyAccountValidationErrorResponseDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/verify-account' })
  declare endpoint: string;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [{ field: 'token', message: 'token must be a UUID' }],
  })
  declare errors: FieldErrorDto[];
}

/** 400 Validation Error for Resend Verification Email endpoint. */
export class ResendVerificationEmailValidationErrorResponseDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/resend-verification-email' })
  declare endpoint: string;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [
      { field: 'email', message: 'email must be a valid email address' },
    ],
  })
  declare errors: FieldErrorDto[];
}

/** 400 Validation Error for Login endpoint. */
export class LoginValidationErrorResponseDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/login' })
  declare endpoint: string;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [
      { field: 'email', message: 'email must be a valid email address' },
      { field: 'password', message: 'password should not be empty' },
    ],
  })
  declare errors: FieldErrorDto[];
}

/** 400 Validation Error for Forgot Password endpoint. */
export class ForgotPasswordValidationErrorResponseDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/forgot-password' })
  declare endpoint: string;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [
      { field: 'email', message: 'email must be a valid email address' },
      {
        field: 'platform',
        message: `platform must be one of - ${Object.values(Platform).join(', ')}`,
      },
    ],
  })
  declare errors: FieldErrorDto[];
}

/** 400 Validation Error for Verify OTP endpoint. */
export class VerifyOtpValidationErrorResponseDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/verify-otp' })
  declare endpoint: string;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [
      { field: 'email', message: 'email must be a valid email address' },
      {
        field: 'otp',
        message: 'otp must be longer than or equal to 6 characters',
      },
    ],
  })
  declare errors: FieldErrorDto[];
}

/** 400 Validation Error for Reset Password endpoint. */
export class ResetPasswordValidationErrorResponseDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/reset-password' })
  declare endpoint: string;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [
      { field: 'email', message: 'email must be a valid email address' },
      {
        field: 'newPassword',
        message: 'newPassword must be at least 8 characters',
      },
    ],
  })
  declare errors: FieldErrorDto[];
}

/** 400 Validation Error for Change Password endpoint. */
export class ChangePasswordValidationErrorResponseDto extends ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/change-password' })
  declare endpoint: string;

  @ApiProperty({
    type: [FieldErrorDto],
    example: [
      { field: 'oldPassword', message: 'oldPassword should not be empty' },
      {
        field: 'newPassword',
        message: 'newPassword must be at least 8 characters',
      },
    ],
  })
  declare errors: FieldErrorDto[];
}
