// import { ContextInterceptor } from '@libs/application/context/ContextInterceptor';
// import { ExceptionInterceptor } from '@libs/application/interceptors/exception.interceptor';

import { LOGGER_PORT } from '@libs/ports/logger.port';
import { RequestContextModule } from 'nestjs-request-context';
// import { AuthModule } from '@modules/auth/auth-module';
import { Module } from '@nestjs/common';
// import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ELKLoggerService } from './libs/logger/elk.logger.service';
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
    EventEmitterModule.forRoot(),
    RequestContextModule,
    CqrsModule,
    // // QueueModule.forRootAsync({
    // //   useFactory: async () => ({
    // //     isGlobal: true,
    // //     ...bullConfig,
    // //   }),
    // // }),
    // CacheModule.forRootAsync({
    //   useFactory: async () => ({
    //     isGlobal: true,
    //     ...cacheConfig,
    //   }),
    // }),
    // MinioModule.forRootAsync({
    //   useFactory: async () => minioConfig,
    // }),
    // ApiLogModule,
    // WebSocketModule,
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
