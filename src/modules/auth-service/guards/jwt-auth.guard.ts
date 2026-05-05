/**
 * @fileoverview JWT Authentication Guard.
 *
 * Intercepts every request on a JWT-protected route and performs a two-step
 * token resolution before delegating to Passport:
 *
 *  1. Extracts the Redis key (`userId:deviceId`) from `Authorization: Bearer`.
 *  2. Fetches the real signed JWT from Redis (validates the session is active).
 *  3. Swaps the header value so the upstream `passport-jwt` strategy receives
 *     the actual JWT for signature / expiry verification.
 *
 * i18n support:
 *  Error messages are localised by reading the `lang` header from the request.
 *  Supported locales: `en` (default), `bn`.
 *
 * @module auth-service/guards
 */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getSystemMessages, resolveLangFromRequest } from 'src/common/i18n';
import { RedisTokenService } from 'src/common/redis/redis-service/auth/redis-token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly redisTokenService: RedisTokenService) {
    super();
  }

  /**
   * Resolves the Redis-backed token, swaps the Authorization header for the
   * real JWT, and delegates to the Passport `jwt` strategy.
   *
   * Throws a localised {@link UnauthorizedException} when:
   *  - The `Authorization` header is missing or malformed.
   *  - The Redis key does not resolve to a stored token (session expired or
   *    explicitly logged out).
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const lang = resolveLangFromRequest(request);
    const m = getSystemMessages(lang);

    const authHeader: string = request.headers.authorization ?? '';

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(m.AUTH_HEADER_MISSING);
    }

    const redisKey = authHeader.split(' ')[1];
    const realJwt = await this.redisTokenService.getToken(redisKey);

    if (!realJwt) {
      throw new UnauthorizedException(m.SESSION_EXPIRED);
    }

    // Swap out the Redis key for the real JWT so Passport can verify it
    request.headers.authorization = `Bearer ${realJwt}`;
    // Preserve original key so AuthController.logout can delete it
    request['redisKey'] = redisKey;

    return super.canActivate(context) as Promise<boolean>;
  }

  /**
   * Override Passport's default error handling so Passport strategy
   * validation failures (e.g. JWT signature mismatch) are also localised.
   */
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const lang = resolveLangFromRequest(request);
      const m = getSystemMessages(lang);
      throw new UnauthorizedException(m.INVALID_TOKEN);
    }
    return user;
  }
}
