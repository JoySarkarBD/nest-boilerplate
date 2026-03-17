/**
 * @fileoverview Root application module.
 * Bootstraps all feature modules and registers global controllers.
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import config from './shared/config/app.config';
import { CatController } from './cat/cat.controller';
import { CatService } from './cat/cat.service';
import { RedisModule } from './common/redis/redis.module';
import { EmailModule } from './common/email/email.module';
import { EmailTestController } from './common/email/email-test.controller';
import { FileUploadTestController } from './common/file-upload/file-upload-test.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

/**
 * The root module of the application.
 * It is responsible for orchestrating the overall application structure by importing
 * feature modules and registering core services and controllers.
 */
@Module({
  imports: [
    MongooseModule.forRoot(config.MONGO_URI),
    RedisModule,
    EmailModule,
    AuthModule,
    UserModule,
  ],
  controllers: [CatController, EmailTestController, FileUploadTestController],
  providers: [CatService],
})
export class AppModule {}
