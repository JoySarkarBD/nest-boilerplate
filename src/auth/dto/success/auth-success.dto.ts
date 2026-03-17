/**
 * @fileoverview Generic success response DTO for Auth endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Methods } from 'src/common/enum/methods.enum';
import type { LoginResponseDto } from '../../interfaces/auth.interface';

/** 200 for successful authentication operations */
export class RegisterSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({
    example: 'Registration successful. Please verify your email.',
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

/** 200 for successful verification */
export class VerifyAccountSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Account verified successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/verify-account' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

/** 200 for successful resend verification email */
export class ResendVerificationEmailSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Verification email resent successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/resend-verification-email' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

/** 200 for successful login */
export class LoginSuccessResponseDto extends SuccessResponseDto<LoginResponseDto> {
  @ApiProperty({ example: 'Login successful' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/login' })
  declare endpoint: string;

  @ApiProperty({
    example: {
      access_token: '123e4567-e89b-12d3-a456-426614174000',
      user: {
        sub: '60d0fe4f5311236168a109ca',
        email: 'user@example.com',
        fullName: 'John Doe',
        role: 'INSPECTOR',
      },
    },
  })
  declare data: LoginResponseDto;
}

/** 200 for successful forgot password */
export class ForgetPasswordSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Password reset email sent successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/forgot-password' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

/** 200 for successful OTP verification */
export class VerifyOtpSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'OTP verified successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/verify-otp' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

/** 200 for successful password reset */
export class ResetPasswordSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Password reset successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/reset-password' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

/** 200 for successful password change */
export class ChangePasswordSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Password changed successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/change-password' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}

/** 200 for successful logout */
export class LogoutSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Logout successful' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/auth/logout' })
  declare endpoint: string;

  @ApiProperty({ example: null })
  declare data: null;
}
