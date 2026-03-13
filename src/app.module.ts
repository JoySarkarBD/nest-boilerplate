/**
 * @fileoverview Root module of the API Gateway.
 *
 * Imports all feature modules,
 * and wires up the health-check controller.
 */
import { Module } from '@nestjs/common';
import { CatController } from './cat/cat.controller';
import { CatService } from './cat/cat.service';
import { RedisModule } from './common/redis/redis.module';
import { EmailModule } from './common/email/email.module';
import { EmailTestController } from './common/email/email-test.controller';

@Module({
  imports: [RedisModule, EmailModule],
  controllers: [CatController, EmailTestController],
  providers: [CatService],
})
export class AppModule {}
