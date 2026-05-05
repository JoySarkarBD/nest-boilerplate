/**
 * @fileoverview Root application module.
 *
 * Changes from Mongoose → PostgreSQL/Prisma migration:
 *  - Removed: MongooseModule.forRoot(...)
 *  - Added:   PrismaModule (global, provides PrismaService everywhere)
 *
 * PrismaModule is `@Global()` — import it ONCE here, all feature
 * modules receive PrismaService via DI automatically.
 *
 * @module app
 */
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth-service/auth.module';
import { UserModule } from 'src/modules/user-service/user.module';
import { FileUploadTestController } from './common/file-upload/file-upload-test.controller';
import { RedisModule } from './common/redis/redis.module';
import { EmailModule } from './modules/email-service/email.module';
import { EmailTestController } from './modules/email-service/test-email-service/email-test.controller';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [
    // ── Infrastructure ──────────────────────────────────────────
    PrismaModule, // Global PostgreSQL client via Prisma
    RedisModule, // Redis for sessions, queues, throttle
    EmailModule, // Transactional email via BullMQ

    // ── Feature modules ──────────────────────────────────────────
    HealthModule,
    AuthModule,
    UserModule,
  ],
  controllers: [EmailTestController, FileUploadTestController],
  providers: [],
})
export class AppModule {}
