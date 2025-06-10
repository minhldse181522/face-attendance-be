import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { ShiftModule } from '@src/modules/shift/shift.module';
import { UserContractModule } from '@src/modules/user-contract/user-contract.module';
import { PrismaWorkingScheduleRepository } from '@src/modules/working-schedule/database/working-schedule.repository.prisma';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { WorkingScheduleModule } from '@src/modules/working-schedule/working-schedule.module';
import { CreateLichLamViecHttpController } from './commands/tao-lich-lam-viec/tao-lich-lam-viec.http.controller';
import { CreateLichLamViecService } from './commands/tao-lich-lam-viec/tao-lich-lam-viec.service';
import { LichLamViecRepository } from './database/lich-lam-viec.repository.prisma';
import { LICH_LAM_VIEC_REPOSITORY } from './lich-lam-viec.di-tokens';
import { FindLichLamViecHttpController } from './queries/find-lich-lam-viec/find-lich-lam-viec.http.controller';
import { FindLichLamViecQueryHandler } from './queries/find-lich-lam-viec/find-lich-lam-viec.query-handler';
import { LichLamViecMapper } from './mappers/lich-lam-viec.mapper';
import { ChamCongHttpController } from './commands/cham-cong/cham-cong.http.controller';
import { UpdateChamCongService } from './commands/cham-cong/cham-cong.service';

const httpControllers = [
  FindLichLamViecHttpController,
  CreateLichLamViecHttpController,
  ChamCongHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateLichLamViecService,
  UpdateChamCongService,
];

const queryHandlers: Provider[] = [FindLichLamViecQueryHandler];

const mappers: Provider[] = [LichLamViecMapper];

const repositories: Provider[] = [
  {
    provide: LICH_LAM_VIEC_REPOSITORY,
    useClass: LichLamViecRepository,
  },
  {
    provide: WORKING_SCHEDULE_REPOSITORY,
    useClass: PrismaWorkingScheduleRepository,
  },
];

const utilities: Provider[] = [GenerateCode];

@Module({
  imports: [CqrsModule, UserContractModule, ShiftModule, WorkingScheduleModule],
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
