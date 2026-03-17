/**
 * @fileoverview Authentication module.
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from 'src/common/redis/redis.module';
import { EmailModule } from 'src/common/email/email.module';
import { UserModule } from 'src/user/user.module';
import config from 'src/shared/config/app.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RedisTokenService } from 'src/common/redis/redis-service/auth/redis-token.service';

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
