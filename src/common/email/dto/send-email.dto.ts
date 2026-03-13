import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class SendEmailDto {
  /**
   * Single recipient address OR an array for bulk send.
   * Validated as a proper e-mail format.
   */
  @ApiProperty({
    description: 'Single email address or an array of addresses for multi-recipient send.',
    oneOf: [
      { type: 'string', example: 'user@example.com' },
      { type: 'array', items: { type: 'string' }, example: ['alice@example.com', 'bob@example.com'] },
    ],
  })
  @ValidateIf((o) => !Array.isArray(o.to))
  @IsEmail()
  @ValidateIf((o) => Array.isArray(o.to))
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  to: string | string[];

  @ApiProperty({
    type: String,
    example: 'Test Email',
    required: true,
  })
  @IsString()
  subject: string;

  /** Caller-supplied HTML body. You are responsible for building the HTML string. */
  @ApiProperty({
    type: String,
    example: 'Test Email',
    required: false,
  })
  @IsOptional()
  @IsString()
  html?: string;

  /** Plain-text fallback. */
  @ApiProperty({
    type: String,
    example: 'Test Email',
    required: false,
  })
  @IsOptional()
  @IsString()
  text?: string;
}
