// import { ContextInterceptor } from '@libs/application/context/ContextInterceptor';
// import { ExceptionInterceptor } from '@libs/application/interceptors/exception.interceptor';
import { LOGGER_PORT } from '@libs/ports/logger.port';
import { Module } from '@nestjs/common';
import { RequestContextModule } from 'nestjs-request-context';
// import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ELKLoggerService } from './libs/logger/elk.logger.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaMultiTenantModule } from './libs/prisma/prisma-multi-tenant.module';
import { databaseConfig } from '@config/database.config';
// import { DropDownModule } from './modules/dropdown/dropdown.module';
import { CacheModule } from './libs/cache/cache.module';
import { cacheConfig } from './configs/cache.config';
import { RoleModule } from './modules/role/role.module';
import { FormModule } from './modules/form/form.module';
// import { ApiLogInterceptor } from './libs/application/interceptors/api-log.interceptor';
const interceptors = [
  // {
  //   provide: APP_INTERCEPTOR,
  //   useClass: ContextInterceptor,
  // },
  // {
  //   provide: APP_INTERCEPTOR,
  //   useClass: ExceptionInterceptor,
  // },
  // {
  //   provide: APP_INTERCEPTOR,
  //   useClass: ApiLogInterceptor,
  // },
];

@Module({
  imports: [
    PrismaMultiTenantModule.forRootAsync({
      useFactory: async () => ({
        isGlobal: true,
        databaseUrl: databaseConfig.databaseUrl,
      }),
    }),
    EventEmitterModule.forRoot(),
    RequestContextModule,
    CqrsModule,
    // // QueueModule.forRootAsync({
    // //   useFactory: async () => ({
    // //     isGlobal: true,
    // //     ...bullConfig,
    // //   }),
    // // }),
    CacheModule.forRootAsync({
      useFactory: async () => ({
        isGlobal: true,
        ...cacheConfig,
      }),
    }),
    // MinioModule.forRootAsync({
    //   useFactory: async () => minioConfig,
    // }),
    // ApiLogModule,
    // WebSockmetModule,
    // DropDownModule,
    RoleModule,
    UserModule,
    AuthModule,
    FormModule,
  ],
  controllers: [],
  providers: [
    ...interceptors,
    {
      provide: LOGGER_PORT,
      useClass: ELKLoggerService,
    },
  ],
})
export class AppModule {}
