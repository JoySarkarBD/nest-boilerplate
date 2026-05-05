/**
 * @fileoverview DTO for user registration.
 *
 * IMPORTANT — message strategy:
 * - Standard decorators (@IsString, @IsNotEmpty, @IsEmail, @MinLength,
 *   @IsEnum) have NO `message:` option. class-validator produces a
 *   constraint name (e.g. `isNotEmpty`) which {@link I18nValidationPipe}
 *   maps to the correct locale string.
 * - Custom @Matches decorators carry a stable English sentinel string that
 *   translateConstraint() matches by substring to pick the right locale key.
 * - The cross-field @IsEmailOrPhoneExclusive carries its own sentinel string.
 * - Never inline translated strings here — add them to locales/ instead.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function IsEmailOrPhoneExclusive(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrPhoneExclusive',
      target: (object as { constructor: Function }).constructor,
      propertyName,
      options: {
        message: 'Provide either email or phone — not both and not neither.',
        ...validationOptions,
      },
      validator: {
        validate(_value: unknown, args: ValidationArguments): boolean {
          const obj = args.object as RegisterDto;
          const hasEmail =
            obj.email !== undefined && obj.email !== null && obj.email !== '';
          const hasPhone =
            obj.phone !== undefined && obj.phone !== null && obj.phone !== '';
          return hasEmail !== hasPhone;
        },
      },
    });
  };
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Login identifier — supply either email or phone, never both.',
  })
  @ValidateIf((o: RegisterDto) => !o.phone)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: '+8801712345678',
    description:
      'Bangladeshi mobile number — supply either phone or email, never both.',
  })
  @ValidateIf((o: RegisterDto) => !o.email)
  @IsString()
  @Matches(/^(\+?88)?01[3-9]\d{8}$/, {
    message: 'phone must be a valid Bangladeshi mobile number',
  })
  @IsOptional()
  phone?: string;

  /** @internal Cross-field XOR guard — not a real field. */
  @IsEmailOrPhoneExclusive()
  private readonly _emailOrPhoneGuard: undefined = undefined;

  @ApiProperty({
    example: 'Password123!',
    description:
      'Min 8 chars with uppercase, lowercase, number, and special character',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message:
      'Password must contain at least one uppercase, lowercase, number and special character',
  })
  password!: string;

  @ApiProperty({ example: UserRole.CUSTOMER, enum: UserRole })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
