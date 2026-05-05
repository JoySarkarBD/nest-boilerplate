/**
 * @fileoverview User Data Access Object (DAO).
 *
 * Responsibility: ALL and ONLY database operations for the User model.
 * The DAO layer sits between PrismaService and UserService:
 *
 *   Controller → Service (business logic) → DAO (DB queries) → Prisma → PostgreSQL
 *
 * Why a separate DAO layer?
 *  - Single Responsibility: service contains business rules, DAO contains
 *    query logic. Swap Prisma for raw SQL tomorrow — only DAO changes.
 *  - Security: password field is NEVER returned by default. Every method
 *    that needs the password hash must explicitly call `findWithPassword`.
 *  - Testability: mock the DAO in service unit tests with zero DB overhead.
 *  - Reuse: multiple services can inject UserDAO without duplicating queries.
 *
 * Password field policy:
 *  - Default `select` omits `password` everywhere except `findWithPassword`.
 *  - This prevents accidental password leakage through API responses.
 *
 * @module user-service/dao
 */
import { Injectable } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';

// ── Reusable select objects ─────────────────────────────────────────────────

/**
 * Safe public projection — password and OTP fields are excluded.
 * Used for all reads that do not require password comparison.
 */
const PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  acc_verified: true,
  role: true,
  created_at: true,
  updated_at: true,
  // Intentionally omitted: password, acc_verification_otp,
  //                         reset_pass_otp, reset_pass_otp_expired_at
} satisfies Prisma.UserSelect;

/**
 * Full projection including password — only used internally for auth.
 * Never expose the result of this select over the wire.
 */
const WITH_PASSWORD_SELECT = {
  ...PUBLIC_SELECT,
  password: true,
} satisfies Prisma.UserSelect;

/**
 * OTP projection — includes OTP fields needed for verification flows.
 */
const WITH_OTP_SELECT = {
  ...PUBLIC_SELECT,
  acc_verification_otp: true,
  reset_pass_otp: true,
  reset_pass_otp_expired_at: true,
} satisfies Prisma.UserSelect;

// ── Types ───────────────────────────────────────────────────────────────────

/** Public user shape returned by most DAO reads. */
export type PublicUser = Omit<
  User,
  | 'password'
  | 'acc_verification_otp'
  | 'reset_pass_otp'
  | 'reset_pass_otp_expired_at'
>;

/** User shape with password — for auth use only. */
export type UserWithPassword = PublicUser & { password: string };

/** User shape with OTP fields — for verification flows. */
export type UserWithOtp = PublicUser & {
  acc_verification_otp: string | null;
  reset_pass_otp: string | null;
  reset_pass_otp_expired_at: Date | null;
};

/** Data required to create a new user record. */
export interface CreateUserData {
  name: string;
  /** Email login identifier — mutually exclusive with `phone`. */
  email?: string;
  /** Phone login identifier — mutually exclusive with `email`. */
  phone?: string;
  password: string; // pre-hashed
  role: UserRole;
  avatar?: string;
  acc_verification_otp?: string;
  acc_verified?: boolean;
}

/** Partial data for updating a user record. */
export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  password?: string; // pre-hashed
  acc_verified?: boolean;
  acc_verification_otp?: string | null;
  reset_pass_otp?: string | null;
  reset_pass_otp_expired_at?: Date | null;
}

// ── DAO ─────────────────────────────────────────────────────────────────────

@Injectable()
export class UserDAO {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persist a new user to the database.
   *
   * @param data - Validated, pre-hashed user creation data.
   * @returns The created public user (no password).
   */
  async create(data: CreateUserData): Promise<PublicUser> {
    return this.prisma.user.create({
      data,
      select: PUBLIC_SELECT,
    });
  }

  /**
   * Find a user by their UUID primary key.
   * Returns public projection — no password.
   *
   * @param id - UUID of the user.
   */
  async findById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_SELECT,
    });
  }

  /**
   * Find a user by email — public projection.
   * Use `findWithPassword` when you need the hash for comparison.
   *
   * @param email - Email address to search.
   */
  async findByEmail(email: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: PUBLIC_SELECT,
    });
  }

  /**
   * Find a user by email including the password hash.
   * ONLY used by auth service for login and password change flows.
   * Result MUST NOT be serialised into any API response.
   *
   * @param email - Email address to search.
   */
  async findWithPassword(email: string): Promise<UserWithPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: WITH_PASSWORD_SELECT,
    });
  }

  /**
   * Find a user by ID including the password hash.
   * Used by change-password flow where we need to verify old password.
   *
   * @param id - UUID of the user.
   */
  async findByIdWithPassword(id: string): Promise<UserWithPassword | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: WITH_PASSWORD_SELECT,
    });
  }

  /**
   * Find a user by email including OTP fields.
   * Used by verification and password reset flows.
   *
   * @param email - Email address to search.
   */
  async findWithOtp(email: string): Promise<UserWithOtp | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: WITH_OTP_SELECT,
    });
  }

  /**
   * Find a user by their account verification OTP.
   * Used during email verification to locate the target user.
   *
   * @param otp - 6-digit verification OTP sent to user email.
   */
  async findByVerificationOtp(otp: string): Promise<UserWithOtp | null> {
    return this.prisma.user.findFirst({
      where: { acc_verification_otp: otp },
      select: WITH_OTP_SELECT,
    });
  }

  /**
   * Update a user record by ID.
   * Returns the updated public user.
   *
   * @param id - UUID of the user to update.
   * @param data - Fields to update.
   */
  async update(id: string, data: UpdateUserData): Promise<PublicUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: PUBLIC_SELECT,
    });
  }

  /**
   * Bulk-invalidate sensitive fields after password reset.
   * Clears OTP, OTP expiry in a single atomic update.
   *
   * @param id - UUID of the user.
   * @param newPassword - Pre-hashed new password.
   */
  async resetPasswordAndClearOtp(
    id: string,
    newPassword: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        password: newPassword,
        reset_pass_otp: null,
        reset_pass_otp_expired_at: null,
      },
    });
  }

  /**
   * Mark account as verified and clear the verification OTP.
   *
   * @param id - UUID of the user.
   */
  async markVerifiedAndClearOtp(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        acc_verified: true,
        acc_verification_otp: null,
      },
    });
  }

  /**
   * Check if an email address is already registered.
   * Lightweight existence check — no model hydration.
   *
   * @param email - Email to check.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  /**
   * Check if a phone number is already registered.
   *
   * @param phone - E.164-normalised phone number to check.
   */
  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { phone } });
    return count > 0;
  }

  /**
   * Find a user by phone number — public projection.
   *
   * @param phone - E.164-normalised phone number.
   */
  async findByPhone(phone: string): Promise<PublicUser | null> {
    return this.prisma.user.findFirst({
      where: { phone },
      select: PUBLIC_SELECT,
    });
  }

  /**
   * Find a user by phone number including the password hash.
   * ONLY used by auth service for login flows on phone-registered accounts.
   * Result MUST NOT be serialised into any API response.
   *
   * @param phone - E.164-normalised phone number.
   */
  async findWithPasswordByPhone(
    phone: string,
  ): Promise<UserWithPassword | null> {
    return this.prisma.user.findFirst({
      where: { phone },
      select: WITH_PASSWORD_SELECT,
    });
  }

  /**
   * Find a user by phone number including OTP fields.
   * Used by phone-based verification and password reset flows.
   *
   * @param phone - E.164-normalised phone number.
   */
  async findWithOtpByPhone(phone: string): Promise<UserWithOtp | null> {
    return this.prisma.user.findFirst({
      where: { phone },
      select: WITH_OTP_SELECT,
    });
  }
}
