/**
 * @fileoverview User module.
 *
 * Provides UserService and UserDAO to the rest of the application.
 * PrismaService is injected globally via PrismaModule — no need to
 * import it here.
 *
 * @module user-service
 */
import { Module } from '@nestjs/common';
import { UserDAO } from './dao/user.dao';
import { UserService } from './user.service';

@Module({
  providers: [UserDAO, UserService],
  exports: [UserService],
})
export class UserModule {}
