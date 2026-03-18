/**
 * @fileoverview User schema definition using Mongoose.
 * Defines the user profile, authentication details, and roles.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { customAlphabet } from 'nanoid';

// Use safe alphabet (no confusing chars: 0/O, 1/I/l, etc.)
const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 6); // 6 chars ≈ 62^6 = ~56 billion possibilities

/**
 * User roles supported by the application.
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  INSPECTOR = 'INSPECTOR',
}

@Schema({ timestamps: true })
export class User extends Document {
  // Auto-generated short unique ID (public-facing)
  @Prop({
    type: String,
    unique: true,
    index: true,
    default: () => nanoid(), // auto-generate on create
  })
  userId!: string;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true, select: false }) // hide in queries by default
  password!: string;

  @Prop({ default: false })
  accountVerified!: boolean;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.INSPECTOR,
  })
  role!: UserRole;

  @Prop()
  verificationToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  otp?: string;

  @Prop()
  otpExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index the email field for faster queries and ensure uniqueness
UserSchema.index({ fullName: 'text', email: 'text', role: 'text' });
