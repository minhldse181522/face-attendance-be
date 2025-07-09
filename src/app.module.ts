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
import { FormDescriptionModule } from './modules/form-description/form-description.module';
import { BranchModule } from './modules/branch/branch.module';
import { DropDownModule } from './modules/dropdown/dropdown.module';
import { UserBranchModule } from './modules/user-branch/user-branch.module';
import { UserContractModule } from './modules/user-contract/user-contract.module';
import { PositionModule } from './modules/position/position.module';
import { WorkingScheduleModule } from './modules/working-schedule/working-schedule.module';
import { BsUserModule } from './apps/bs_user/bs-user.module';
import { BsUserContractModule } from './apps/bs-user-contract/user-contract.module';
import { ShiftModule } from './modules/shift/shift.module';
import { TimeKeepingModule } from './modules/time-keeping/time-keeping.module';
import { LichLamViecModule } from './apps/bs_lich_lam_viec/lich-lam-viec.module';
import { MinioModule } from './libs/minio/minio.module';
import { minioConfig } from './configs/minio.config';
import { UploadModule } from './modules/upload/upload.module';
import { FaceReferenceModule } from './modules/face-reference/face-reference.module';
import { PayrollModule } from './modules/payroll/payroll.module';
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
    MinioModule.forRootAsync({
      useFactory: async () => minioConfig,
    }),
    // ApiLogModule,
    // WebSockmetModule,
    UploadModule,
    DropDownModule,
    PositionModule,
    BranchModule,
    RoleModule,
    UserModule,
    AuthModule,
    FormModule,
    FormDescriptionModule,
    UserBranchModule,
    UserContractModule,
    WorkingScheduleModule,
    ShiftModule,
    TimeKeepingModule,
    FaceReferenceModule,
    PayrollModule,

    // Business
    BsUserModule,
    BsUserContractModule,
    LichLamViecModule,
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
