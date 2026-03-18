/**
 * @fileoverview Authentication service for handling business logic.
 */
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/common/email/email.service';
import { RedisTokenService } from 'src/common/redis/redis-service/auth/redis-token.service';
import config from 'src/shared/config/app.config';
import type { AuthUser } from 'src/shared/interfaces/auth-user.interface';
import { ServicePayload } from 'src/shared/interfaces/response.interface';
import { UserRole } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, Platform } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import type { LoginResponseDto } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisTokenService: RedisTokenService,
    private readonly emailService: EmailService,
  ) {}

  /** Register user */
  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      config.BCRYPT_SALT_ROUNDS,
    );
    const verificationToken = uuidv4();

    const user = await this.userService.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      verificationToken,
      accountVerified: false,
      role: dto.role as UserRole,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify your account',
      html: `<p>Your verification token is: <b>${verificationToken}</b></p>`,
    });

    return {
      message: 'Registration successful. Please verify your email.',
    };
  }

  /** Verify account */
  async verifyAccount(dto: VerifyAccountDto) {
    const user = await this.userService.findByVerificationToken(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.userService.update(user._id as unknown as string, {
      accountVerified: true,
      verificationToken: undefined,
    });

    return {
      message: 'Account verified successfully',
    };
  }

  /** Resend verification email */
  async resendVerificationEmail(dto: ResendVerificationDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.accountVerified) {
      throw new BadRequestException('Account already verified');
    }

    const verificationToken = uuidv4();
    await this.userService.update(user._id as unknown as string, {
      verificationToken,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify your account',
      html: `<p>Your new verification token is: <b>${verificationToken}</b></p>`,
    });

    return {
      message: 'Verification email resent successfully',
    };
  }

  /** Login */
  async login(
    dto: LoginDto,
    deviceId: string,
  ): Promise<ServicePayload<LoginResponseDto>> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.accountVerified) {
      throw new UnauthorizedException('Account not verified');
    }

    const payload = {
      sub: user._id as unknown as string,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const jwt = await this.jwtService.signAsync(payload);
    const tokenId = `${user._id as unknown as string}:${deviceId}`;

    await this.redisTokenService.storeToken(
      tokenId,
      jwt,
      config.JWT_EXPIRES_IN,
    );

    return {
      message: 'Login successful',
      data: { access_token: `${tokenId}`, user: payload },
    };
  }

  /** Forgot Password */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new HttpException(
        'If you have an account, you will receive an email shortly.',
        404,
      );
    }

    if (dto.platform === Platform.WEB) {
      const resetToken = uuidv4();
      const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      await this.userService.update(user._id as unknown as string, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiry,
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Reset Password',
        html: `<p>Your reset token is: <b>${resetToken}</b></p>`,
      });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      await this.userService.update(user._id as unknown as string, {
        otp,
        otpExpires: expiry,
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Reset Password OTP',
        html: `<p>Your OTP is: <b>${otp}</b></p>`,
      });
    }

    return {
      message: 'If you have an account, you will receive an email shortly.',
    };
  }

  /** Verify OTP */
  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (
      !user ||
      user.otp !== dto.otp ||
      (user.otpExpires && user.otpExpires < new Date())
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'OTP verified successfully',
    };
  }

  /** Reset Password */
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (dto.token) {
      if (
        user.resetPasswordToken !== dto.token ||
        (user.resetPasswordExpires && user.resetPasswordExpires < new Date())
      ) {
        throw new BadRequestException('Invalid or expired token');
      }
    } else if (dto.otp) {
      if (
        user.otp !== dto.otp ||
        (user.otpExpires && user.otpExpires < new Date())
      ) {
        throw new BadRequestException('Invalid or expired OTP');
      }
    } else {
      throw new BadRequestException('Token or OTP is required');
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      config.BCRYPT_SALT_ROUNDS,
    );
    await this.userService.update(user._id as unknown as string, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      otp: undefined,
      otpExpires: undefined,
    });

    await this.redisTokenService.deleteUserTokens(
      user._id as unknown as string,
    );

    return {
      message: 'Password reset successfully',
    };
  }

  /** Change Password */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      config.BCRYPT_SALT_ROUNDS,
    );
    await this.userService.update(user._id as unknown as string, {
      password: hashedPassword,
    });

    await this.redisTokenService.deleteUserTokens(
      user._id as unknown as string,
    );

    return {
      message: 'Password changed successfully',
    };
  }

  /** Logout */
  async logout(userId: AuthUser['_id'], deviceId: string) {
    const tokenId = `${userId}:${deviceId}`;
    console.log(tokenId);
    await this.redisTokenService.deleteToken(tokenId);

    return {
      message: 'Logged out successfully',
    };
  }
}
