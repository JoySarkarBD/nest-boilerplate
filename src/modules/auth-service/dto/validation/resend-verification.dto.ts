/**
 * @fileoverview DTO for resending account verification OTP.
 * No custom messages — constraint names drive i18n translation in the pipe.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
