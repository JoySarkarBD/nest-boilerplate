/**
 * @fileoverview i18n-aware global validation pipe.
 *
 * Replaces the stock NestJS ValidationPipe. Runs class-validator on every
 * incoming DTO then translates each field-level constraint message into the
 * locale indicated by the `lang` request header before throwing.
 *
 * ── How translation works ────────────────────────────────────────────────────
 *
 * class-validator attaches a `constraints` object to each ValidationError:
 *   { isNotEmpty: "fullName should not be empty" }   ← built-in, no message option
 *   { matches: "Password must contain …" }            ← custom message sentinel
 *   { isEmailOrPhoneExclusive: "Provide either …" }  ← custom validator sentinel
 *
 * translateConstraint() maps each (constraintName, originalMessage) pair to
 * a locale key in ValidationMessageMap:
 *  - Built-in constraint names (isNotEmpty, isEmail, minLength, length, isEnum…)
 *    → matched by constraintName switch.
 *  - Custom @Matches sentinels (password complexity, phone format)
 *    → matched by stable substring in originalMessage BEFORE the switch.
 *  - Unknown constraints → original English message returned unchanged (safe fallback).
 *
 * ── DTO authoring rules ──────────────────────────────────────────────────────
 *
 * Standard decorators (@IsString, @IsNotEmpty, @IsEmail, @MinLength, @IsEnum,
 * @Length) must have NO `message:` option — constraint name alone drives translation.
 *
 * @Matches decorators that need distinct translations must carry a stable
 * English sentinel string that translateConstraint() matches by substring.
 *
 * Custom validators (@IsEmailOrPhoneExclusive) may carry their own message
 * sentinel — they are matched first before the switch.
 *
 * ── Adding a new field/rule translation ─────────────────────────────────────
 *  1. Add the key + value to locales/en/validation.ts and locales/bn/validation.ts.
 *  2. Add a branch to translateConstraint() below.
 *  3. Done — picked up automatically for every DTO that uses that decorator.
 *
 * @module pipes/i18n-validation
 */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import type { FastifyRequest } from 'fastify';
import { RequestContext } from 'src/common/context/request-context';
import {
  getSystemMessages,
  getValidationMessages,
  resolveLangFromRequest,
  SupportedLang,
  ValidationMessageMap,
} from 'src/common/i18n';

// ─── Constraint translator ────────────────────────────────────────────────────

/**
 * Maps one class-validator constraint to a localised string.
 *
 * @param constraintName  - class-validator key (e.g. `isNotEmpty`, `matches`).
 * @param field           - DTO property name (used by function-style locale keys).
 * @param originalMessage - The message string class-validator produced.
 * @param v               - Validation message map for the resolved locale.
 */
function translateConstraint(
  constraintName: string,
  field: string,
  originalMessage: string,
  v: ValidationMessageMap,
): string {
  // ── 1. Custom validator / @Matches sentinel strings ─────────────────────
  // Must be checked BEFORE the constraint-name switch so a generic `matches`
  // constraint key doesn't fall through when it carries a known sentinel.

  if (originalMessage.includes('Provide either email or phone')) {
    return v.EMAIL_OR_PHONE_EXCLUSIVE;
  }

  if (
    originalMessage.includes('uppercase') ||
    originalMessage.includes('lowercase') ||
    originalMessage.includes('special character')
  ) {
    return v.PASSWORD_COMPLEXITY;
  }

  if (originalMessage.includes('Bangladeshi mobile number')) {
    return v.MUST_BE_VALID_PHONE(field);
  }

  // ── 2. Built-in class-validator constraint names ─────────────────────────

  switch (constraintName) {
    case 'isNotEmpty':
      return v.SHOULD_NOT_BE_EMPTY(field);

    case 'isString':
      return v.MUST_BE_STRING(field);

    case 'isEmail':
      return v.MUST_BE_EMAIL(field);

    case 'minLength': {
      // Default message: "X must be longer than or equal to N characters"
      const match = originalMessage.match(/(\d+)/);
      return v.MIN_LENGTH(field, match ? parseInt(match[1], 10) : 1);
    }

    case 'maxLength': {
      const match = originalMessage.match(/(\d+)/);
      return v.MAX_LENGTH(field, match ? parseInt(match[1], 10) : 255);
    }

    case 'length': {
      // Default message: "X must be longer than or equal to N and shorter than or equal to M characters"
      const nums = originalMessage.match(/(\d+)/g);
      if (nums && nums.length >= 2 && nums[0] === nums[1]) {
        // exact length  (min === max)
        return v.EXACT_LENGTH(field, parseInt(nums[0], 10));
      }
      if (nums && nums.length >= 2) {
        // range — show min
        return v.MIN_LENGTH(field, parseInt(nums[0], 10));
      }
      return originalMessage;
    }

    case 'isEnum': {
      // Default message: "X must be a valid enum value" or custom "role must be one of: A, B"
      // Try to extract values from the message; fall back to empty list gracefully.
      const match = originalMessage.match(/:\s*(.+)$/);
      const values = match ? match[1].split(',').map((s) => s.trim()) : [];
      return v.MUST_BE_ENUM(field, values);
    }

    case 'matches':
      // @Matches with no recognised sentinel — return original (safe fallback).
      return originalMessage;

    default:
      return originalMessage;
  }
}

// ─── Pipe ─────────────────────────────────────────────────────────────────────

@Injectable()
export class I18nValidationPipe implements PipeTransform {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    // Skip primitives, query strings, params — only validate class-typed bodies
    const { metatype } = metadata;
    if (!metatype || !this.isClassType(metatype)) return value;

    // Resolve locale via AsyncLocalStorage (set by RequestContext middleware)
    const lang: SupportedLang = this.resolveLang();
    const v = getValidationMessages(lang);
    const s = getSystemMessages(lang);

    // Transform plain object → DTO class instance
    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: false,
      excludeExtraneousValues: false,
    });

    // Run class-validator
    const errors: ValidationError[] = await validate(object as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true, // one error per field — consistent with UX
    });

    if (errors.length === 0) return object;

    // Flatten and translate
    const translated = this.flattenErrors(errors, v);

    throw new BadRequestException({
      message: s.VALIDATION_FAILED,
      errors: translated,
    });
  }

  /**
   * Flatten a (potentially nested) ValidationError tree into
   * `{ field, message }` pairs, translating each constraint message.
   *
   * Only the FIRST constraint on each field is used — mirrors
   * `stopAtFirstError: true` so the UI gets one message per field.
   */
  private flattenErrors(
    errors: ValidationError[],
    v: ValidationMessageMap,
    parentField = '',
  ): { field: string; message: string }[] {
    const result: { field: string; message: string }[] = [];

    for (const err of errors) {
      const field = parentField
        ? `${parentField}.${err.property}`
        : err.property;

      if (err.constraints) {
        const entries = Object.entries(err.constraints);
        // class-validator stores constraints in decorator-application order (bottom-up).
        // We take the last entry = the innermost (highest-priority) constraint.
        const [constraintName, originalMessage] = entries[entries.length - 1];
        result.push({
          field,
          message: translateConstraint(
            constraintName,
            field,
            originalMessage,
            v,
          ),
        });
      }

      if (err.children?.length) {
        result.push(...this.flattenErrors(err.children, v, field));
      }
    }

    return result;
  }

  /** Read `lang` header from the current request via AsyncLocalStorage. */
  private resolveLang(): SupportedLang {
    try {
      const req: FastifyRequest | undefined = RequestContext.currentRequest();
      if (req) return resolveLangFromRequest(req);
    } catch {
      // silent — defaults to EN
    }
    return 'en';
  }

  /** True for ES6 class constructors; false for JS primitives. */
  private isClassType(metatype: unknown): boolean {
    const primitives = [String, Boolean, Number, Array, Object, Map, Set];
    return !primitives.includes(metatype as any);
  }
}
