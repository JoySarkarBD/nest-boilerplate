/**
 * @fileoverview DTO for password reset (OTP-based, step 3 of 3).
 * Standard decorators have NO message — pipe maps by constraint name.
 * @Matches on newPassword carries a stable sentinel string for translateConstraint().
 * @Length(6,6) has no message — pipe maps by 'length' constraint name → EXACT_LENGTH.
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: '483920',
    description: '6-digit OTP from forgot-password step',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Min 8 chars with complexity',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message:
      'Password must contain at least one uppercase, lowercase, number and special character',
  })
  newPassword!: string;
}
