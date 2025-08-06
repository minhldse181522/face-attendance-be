import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { GenerateWorkingDate } from '@src/libs/utils/generate-working-dates.util';
import { ShiftModule } from '@src/modules/shift/shift.module';
import { PrismaTimeKeepingRepository } from '@src/modules/time-keeping/database/time-keeping.repository.prisma';
import { TIME_KEEPING_REPOSITORY } from '@src/modules/time-keeping/time-keeping.di-tokens';
import { TimeKeepingModule } from '@src/modules/time-keeping/time-keeping.module';
import { UserContractModule } from '@src/modules/user-contract/user-contract.module';
import { PrismaWorkingScheduleRepository } from '@src/modules/working-schedule/database/working-schedule.repository.prisma';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { WorkingScheduleModule } from '@src/modules/working-schedule/working-schedule.module';
import { BS_USER_REPOSITORY } from '../bs_user/bs-user.di-tokens';
import { PrismaBsUserRepository } from '../bs_user/database/bs-user.repository.prisma';
import { BsUserMapper } from '../bs_user/mappers/bs-user.mapper';
// import { WorkingScheduleCronService } from './commands/cham-cong/cham-cong-tre.cron.service';
import { ChamCongHttpController } from './commands/cham-cong/cham-cong.http.controller';
import { UpdateChamCongService } from './commands/cham-cong/cham-cong.service';
import { CreateLichLamViecHttpController } from './commands/tao-lich-lam-viec/tao-lich-lam-viec.http.controller';
import { CreateLichLamViecService } from './commands/tao-lich-lam-viec/tao-lich-lam-viec.service';
import { LichLamViecRepository } from './database/lich-lam-viec.repository.prisma';
import { LICH_LAM_VIEC_REPOSITORY } from './lich-lam-viec.di-tokens';
import { LichLamViecMapper } from './mappers/lich-lam-viec.mapper';
import { FindLichLamViecHttpController } from './queries/find-lich-lam-viec/find-lich-lam-viec.http.controller';
import { FindLichLamViecQueryHandler } from './queries/find-lich-lam-viec/find-lich-lam-viec.query-handler';
import { FindUserByManagementHttpController } from './queries/find-user-by-management/find-user-by-management.http.controller';
import { FindUserByManagementQueryHandler } from './queries/find-user-by-management/find-user-by-management.query-handler';
import { NotificationWorkingScheduleCronService } from './commands/nhac-nho-lam-viec/nhac-nho-lam-viec.cron.service';

const httpControllers = [
  FindLichLamViecHttpController,
  CreateLichLamViecHttpController,
  ChamCongHttpController,
  FindUserByManagementHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateLichLamViecService,
  UpdateChamCongService,
  // WorkingScheduleCronService,
  // EndOfDayWorkingScheduleCronService,
  NotificationWorkingScheduleCronService,
];

const queryHandlers: Provider[] = [
  FindLichLamViecQueryHandler,
  FindUserByManagementQueryHandler,
];

const mappers: Provider[] = [LichLamViecMapper, BsUserMapper];

const repositories: Provider[] = [
  {
    provide: LICH_LAM_VIEC_REPOSITORY,
    useClass: LichLamViecRepository,
  },
  {
    provide: WORKING_SCHEDULE_REPOSITORY,
    useClass: PrismaWorkingScheduleRepository,
  },
  {
    provide: TIME_KEEPING_REPOSITORY,
    useClass: PrismaTimeKeepingRepository,
  },
  {
    provide: BS_USER_REPOSITORY,
    useClass: PrismaBsUserRepository,
  },
];

const utilities: Provider[] = [GenerateCode, GenerateWorkingDate];

@Module({
  imports: [
    CqrsModule,
    UserContractModule,
    ShiftModule,
    WorkingScheduleModule,
    TimeKeepingModule,
  ],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...cliControllers,
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
    ...utilities,
  ],
  exports: [...repositories, ...mappers],
})
export class LichLamViecModule {}
