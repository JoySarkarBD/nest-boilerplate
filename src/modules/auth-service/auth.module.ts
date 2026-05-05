/**
 * @fileoverview Authentication module.
 *
 * Wires together all auth-layer providers:
 *  - AuthService (business logic)
 *  - JwtStrategy (passport strategy)
 *  - JwtAuthGuard (route guard)
 *  - RedisTokenService (session management)
 *  - All throttle guards (registered as providers so NestJS DI can inject them)
 *
 * Imports:
 *  - UserModule    — exposes UserService → UserDAO → Prisma
 *  - JwtModule     — signs/verifies JWTs
 *  - PassportModule — activates passport strategies
 *  - RedisModule   — Redis client for token storage and throttling
 *  - EmailModule   — transactional email via BullMQ auth-email queue
 *  - SmsModule     — SMS OTP via BullMQ auth-sms queue
 *
 * @module auth-service
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ChangePasswordThrottleGuard } from 'src/common/throttles/auth/change-password-throttle.guard';
import { ForgotPasswordThrottleGuard } from 'src/common/throttles/auth/forgot-password-throttle.guard';
import { LoginThrottleGuard } from 'src/common/throttles/auth/login-throttle.guard';
import { RegisterThrottleGuard } from 'src/common/throttles/auth/register-throttle.guard';
import { ResendVerificationEmailThrottleGuard } from 'src/common/throttles/auth/resend-verification-email-throttle.guard';
import { ResetPasswordThrottleGuard } from 'src/common/throttles/auth/reset-password-throttle.guard';
import { VerifyOtpThrottleGuard } from 'src/common/throttles/auth/verify-otp-throttle.guard';
import { AuthenticatedUserThrottleGuard } from 'src/common/throttles/user/authenticated-user-throttle.guard';
import { RedisTokenService } from 'src/common/redis/redis-service/auth/redis-token.service';
import { RedisModule } from 'src/common/redis/redis.module';
import { UserModule } from 'src/modules/user-service/user.module';
import config from 'src/shared/config/app.config';
import { EmailModule } from '../email-service/email.module';
import { SmsModule } from '../sms-service/sms.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
    RedisModule,
    EmailModule,
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RedisTokenService,
    // Throttle guards registered in DI so NestJS can inject RedisClientService
    LoginThrottleGuard,
    RegisterThrottleGuard,
    ForgotPasswordThrottleGuard,
    VerifyOtpThrottleGuard,
    ResetPasswordThrottleGuard,
    ChangePasswordThrottleGuard,
    ResendVerificationEmailThrottleGuard,
    AuthenticatedUserThrottleGuard,
  ],
  exports: [AuthService, JwtAuthGuard, AuthenticatedUserThrottleGuard],
})
export class AuthModule {}
