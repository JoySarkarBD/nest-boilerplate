/**
 * @fileoverview Data Transfer Object for forgot password request.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export enum Platform {
  WEB = 'web',
  MOBILE = 'mobile',
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'web', enum: Platform })
  @IsEnum(Platform)
  @IsNotEmpty()
  platform!: Platform;
}
