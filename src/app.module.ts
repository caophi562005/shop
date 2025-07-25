import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './routes/auth/auth.module'
import { SharedModule } from './shared/shared.module'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { CacheModule } from '@nestjs/cache-manager'
import envConfig from './shared/envConfig'
import { createKeyv } from '@keyv/redis'
import { LanguageModule } from './routes/language/language.module'
import { RoleModule } from './routes/role/role.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { PermissionModule } from './routes/permission/permission.module';
import { ProfileModule } from './routes/profile/profile.module';
import { UserModule } from './routes/user/user.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [createKeyv(envConfig.REDIS_URL)],
        }
      },
    }),
    AuthModule,
    SharedModule,
    LanguageModule,
    RoleModule,
    PermissionModule,
    ProfileModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
