/**
 * @fileoverview DTO for account verification via OTP.
 * No custom messages — constraint names drive i18n translation in the pipe.
 * @Length(6,6) with no message → pipe maps by 'length' constraint name → EXACT_LENGTH.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: '483920',
    description: '6-digit OTP sent to registered email',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token!: string;
}
