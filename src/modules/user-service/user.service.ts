/**
 * @fileoverview User service — thin orchestration layer over UserDAO.
 *
 * This service exposes a clean domain API to auth and other consumers.
 * It does NOT contain query logic — that lives in UserDAO.
 * It does NOT contain auth logic — that lives in AuthService.
 *
 * @module user-service
 */
import { Injectable } from '@nestjs/common';
import {
  CreateUserData,
  PublicUser,
  UpdateUserData,
  UserDAO,
  UserWithOtp,
  UserWithPassword,
} from './dao/user.dao';

@Injectable()
export class UserService {
  constructor(private readonly userDAO: UserDAO) {}

  /** Create a new user record. */
  async create(data: CreateUserData): Promise<PublicUser> {
    return this.userDAO.create(data);
  }

  /** Find user by ID (no password). */
  async findById(id: string): Promise<PublicUser | null> {
    return this.userDAO.findById(id);
  }

  /** Find user by email (no password). */
  async findByEmail(email: string): Promise<PublicUser | null> {
    return this.userDAO.findByEmail(email);
  }

  /** Find user by phone number (no password). */
  async findByPhone(phone: string): Promise<PublicUser | null> {
    return this.userDAO.findByPhone(phone);
  }

  /** Find user by email WITH password hash — auth only. */
  async findWithPassword(email: string): Promise<UserWithPassword | null> {
    return this.userDAO.findWithPassword(email);
  }

  /** Find user by phone WITH password hash — auth only (phone-registered accounts). */
  async findWithPasswordByPhone(
    phone: string,
  ): Promise<UserWithPassword | null> {
    return this.userDAO.findWithPasswordByPhone(phone);
  }

  /** Find user by ID WITH password hash — change-password flow. */
  async findByIdWithPassword(id: string): Promise<UserWithPassword | null> {
    return this.userDAO.findByIdWithPassword(id);
  }

  /** Find user by email WITH OTP fields — verification flows. */
  async findWithOtp(email: string): Promise<UserWithOtp | null> {
    return this.userDAO.findWithOtp(email);
  }

  /** Find user by phone WITH OTP fields — phone verification flows. */
  async findWithOtpByPhone(phone: string): Promise<UserWithOtp | null> {
    return this.userDAO.findWithOtpByPhone(phone);
  }

  /** Find user by verification OTP string. */
  async findByVerificationOtp(otp: string): Promise<UserWithOtp | null> {
    return this.userDAO.findByVerificationOtp(otp);
  }

  /** Update arbitrary fields on a user record. */
  async update(id: string, data: UpdateUserData): Promise<PublicUser> {
    return this.userDAO.update(id, data);
  }

  /** Reset password and clear OTP fields atomically. */
  async resetPasswordAndClearOtp(
    id: string,
    newHashedPassword: string,
  ): Promise<void> {
    return this.userDAO.resetPasswordAndClearOtp(id, newHashedPassword);
  }

  /** Mark account verified and clear verification OTP. */
  async markVerifiedAndClearOtp(id: string): Promise<void> {
    return this.userDAO.markVerifiedAndClearOtp(id);
  }

  /** Fast email existence check. */
  async existsByEmail(email: string): Promise<boolean> {
    return this.userDAO.existsByEmail(email);
  }

  /** Fast phone existence check. */
  async existsByPhone(phone: string): Promise<boolean> {
    return this.userDAO.existsByPhone(phone);
  }
}
