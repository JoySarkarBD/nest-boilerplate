/**
 * @fileoverview Authentication controller.
 */
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiHeaders,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from 'src/common/decorators/api-error-response.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ChangePasswordThrottleGuard } from 'src/common/throttles/auth/change-password-throttle.guard';
import { ForgotPasswordThrottleGuard } from 'src/common/throttles/auth/forgot-password-throttle.guard';
import { LoginThrottleGuard } from 'src/common/throttles/auth/login-throttle.guard';
import { RegisterThrottleGuard } from 'src/common/throttles/auth/register-throttle.guard';
import { ResendVerificationEmailThrottleGuard } from 'src/common/throttles/auth/resend-verification-email-throttle.guard';
import { ResetPasswordThrottleGuard } from 'src/common/throttles/auth/reset-password-throttle.guard';
import { VerifyOtpThrottleGuard } from 'src/common/throttles/auth/verify-otp-throttle.guard';
import type { AuthUser } from 'src/shared/interfaces/auth-user.interface';
import { ServicePayload } from 'src/shared/interfaces/response.interface';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ChangePasswordInternalServerErrorDto,
  ForgotPasswordInternalServerErrorDto,
  LoginInternalServerErrorDto,
  LogoutInternalServerErrorDto,
  RegisterInternalServerErrorDto,
  ResendVerificationEmailInternalServerErrorDto,
  ResetPasswordInternalServerErrorDto,
  VerifyAccountInternalServerErrorDto,
  VerifyOtpInternalServerErrorDto,
} from './dto/error/auth-internal-server-error.dto';
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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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
import { VerifyAccountDto } from './dto/verify-account.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { LoginResponseDto } from './interfaces/auth.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiHeaders([
    {
      name: 'x-device-id',
      description: 'Unique identifier for the device making the request',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  ])
  @ApiSuccessResponse(RegisterSuccessResponseDto, 201)
  @ApiErrorResponses({
    throttle: RegisterThrottleResponseDto,
    validation: RegisterValidationErrorResponseDto,
    internal: RegisterInternalServerErrorDto,
  })
  @UseGuards(RegisterThrottleGuard)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Verify account with token' })
  @ApiSuccessResponse(VerifyAccountSuccessResponseDto, 200)
  @ApiErrorResponses({
    validation: VerifyAccountValidationErrorResponseDto,
    internal: VerifyAccountInternalServerErrorDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('verify-account')
  async verifyAccount(@Body() dto: VerifyAccountDto) {
    return this.authService.verifyAccount(dto);
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @ApiHeaders([
    {
      name: 'x-device-id',
      description: 'Unique identifier for the device making the request',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  ])
  @ApiSuccessResponse(ResendVerificationEmailSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: ResendVerificationEmailThrottleResponseDto,
    validation: ResendVerificationEmailValidationErrorResponseDto,
    internal: ResendVerificationEmailInternalServerErrorDto,
  })
  @UseGuards(ResendVerificationEmailThrottleGuard)
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiHeaders([
    {
      name: 'x-device-id',
      description: 'Unique identifier for the device making the request',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  ])
  @ApiSuccessResponse(LoginSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: LoginThrottleResponseDto,
    validation: LoginValidationErrorResponseDto,
    internal: LoginInternalServerErrorDto,
  })
  @UseGuards(LoginThrottleGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers('x-device-id') deviceId: string,
  ): Promise<ServicePayload<LoginResponseDto>> {
    return this.authService.login(dto, deviceId);
  }

  @ApiOperation({ summary: 'Forgot password request' })
  @ApiHeaders([
    {
      name: 'x-device-id',
      description: 'Unique identifier for the device making the request',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  ])
  @ApiSuccessResponse(ForgetPasswordSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: ForgotPasswordThrottleResponseDto,
    validation: ForgotPasswordValidationErrorResponseDto,
    internal: ForgotPasswordInternalServerErrorDto,
  })
  @UseGuards(ForgotPasswordThrottleGuard)
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiOperation({ summary: 'Verify OTP for password reset' })
  @ApiHeaders([
    {
      name: 'x-device-id',
      description: 'Unique identifier for the device making the request',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  ])
  @ApiSuccessResponse(VerifyOtpSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: VerifyOtpThrottleResponseDto,
    validation: VerifyOtpValidationErrorResponseDto,
    internal: VerifyOtpInternalServerErrorDto,
  })
  @UseGuards(VerifyOtpThrottleGuard)
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiHeaders([
    {
      name: 'x-device-id',
      description: 'Unique identifier for the device making the request',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  ])
  @ApiSuccessResponse(ResetPasswordSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: ResetPasswordThrottleResponseDto,
    validation: ResetPasswordValidationErrorResponseDto,
    internal: ResetPasswordInternalServerErrorDto,
  })
  @UseGuards(ResetPasswordThrottleGuard)
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiOperation({ summary: 'Change password (authenticated)' })
  @ApiHeaders([
    {
      name: 'x-device-id',
      description: 'Unique identifier for the device making the request',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  ])
  @ApiSuccessResponse(ChangePasswordSuccessResponseDto, 200)
  @ApiErrorResponses({
    throttle: ChangePasswordThrottleResponseDto,
    validation: ChangePasswordValidationErrorResponseDto,
    internal: ChangePasswordInternalServerErrorDto,
  })
  @UseGuards(JwtAuthGuard, ChangePasswordThrottleGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }

  @ApiOperation({ summary: 'Logout (authenticated)' })
  @ApiHeaders([
    {
      name: 'x-device-id',
      description: 'Unique identifier for the device making the request',
      required: true,
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  ])
  @ApiBearerAuth('Authorization')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    example: 'Bearer 69b8bba8f2e6bd152e34b0f1:x-device-id',
  })
  @ApiSuccessResponse(LogoutSuccessResponseDto, 200)
  @ApiErrorResponses({
    internal: LogoutInternalServerErrorDto,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthUser,
    @Headers('x-device-id') deviceId: string,
  ) {
    return this.authService.logout(user._id!, deviceId);
  }
}
