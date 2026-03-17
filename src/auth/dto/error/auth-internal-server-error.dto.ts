/**
 * @fileoverview Swagger DTOs for 500 Internal Server Error responses.
 */
import { ApiProperty } from '@nestjs/swagger';
import { CustomInternalServerErrorDto } from 'src/common/dto/custom-internal-server-error.dto';
import { Methods } from 'src/common/enum/methods.enum';

/**
 * Represents a 500 Internal Server Error response specifically for register endpoint failures.
 */
export class RegisterInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Registration failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/register' })
  declare endpoint: string;

  @ApiProperty({ example: 'Registration failed' })
  declare error: string;
}

/** 500 Internal Server Error for Verify Account endpoint. */
export class VerifyAccountInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Account verification failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/verify-account' })
  declare endpoint: string;

  @ApiProperty({ example: 'Account verification failed' })
  declare error: string;
}

/** 500 Internal Server Error for Resend Verification Email endpoint. */
export class ResendVerificationEmailInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Resending verification email failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/resend-verification-email' })
  declare endpoint: string;

  @ApiProperty({ example: 'Resending verification email failed' })
  declare error: string;
}

/** 500 Internal Server Error for Login endpoint. */
export class LoginInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Login failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/login' })
  declare endpoint: string;

  @ApiProperty({ example: 'Login failed' })
  declare error: string;
}

/** 500 Internal Server Error for Forgot Password endpoint. */
export class ForgotPasswordInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Forgot password processing failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/forgot-password' })
  declare endpoint: string;

  @ApiProperty({ example: 'Forgot password processing failed' })
  declare error: string;
}

/** 500 Internal Server Error for Verify OTP endpoint. */
export class VerifyOtpInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'OTP verification failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/verify-otp' })
  declare endpoint: string;

  @ApiProperty({ example: 'OTP verification failed' })
  declare error: string;
}

/** 500 Internal Server Error for Reset Password endpoint. */
export class ResetPasswordInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Password reset failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/reset-password' })
  declare endpoint: string;

  @ApiProperty({ example: 'Password reset failed' })
  declare error: string;
}

/** 500 Internal Server Error for Change Password endpoint. */
export class ChangePasswordInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Changing password failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/change-password' })
  declare endpoint: string;

  @ApiProperty({ example: 'Changing password failed' })
  declare error: string;
}

/** 500 Internal Server Error for Logout endpoint. */
export class LogoutInternalServerErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Logout failed' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods;

  @ApiProperty({ example: '/api/auth/logout' })
  declare endpoint: string;

  @ApiProperty({ example: 'Logout failed' })
  declare error: string;
}
