/**
 * @fileoverview Authentication module.
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from 'src/common/email/email.module';
import { RedisTokenService } from 'src/common/redis/redis-service/auth/redis-token.service';
import { RedisModule } from 'src/common/redis/redis.module';
import config from 'src/shared/config/app.config';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
    RedisModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RedisTokenService],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
