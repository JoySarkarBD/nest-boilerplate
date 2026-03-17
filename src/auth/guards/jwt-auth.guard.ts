/**
 * @fileoverview JWT Authentication Guard that fetches the real JWT from Redis.
 */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedisTokenService } from 'src/common/redis/redis-service/auth/redis-token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly redisTokenService: RedisTokenService) {
    super();
  }

  /**
   * Extends the base canActivate to use the Bearer token as a Redis key to fetch the real JWT.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const redisKey = authHeader.split(' ')[1];
      const realJwt = await this.redisTokenService.getToken(redisKey);

      if (realJwt) {
        // Swap out the header for the real JWT so Passport can verify it.
        request.headers.authorization = `Bearer ${realJwt}`;
        request['redisKey'] = redisKey; // Store the original key for logout.
      } else {
        throw new UnauthorizedException('Session expired or invalid token');
      }
    } else {
      throw new UnauthorizedException(
        'Authorization header is missing or malformed',
      );
    }

    return super.canActivate(context) as boolean;
  }
}
