import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { ShiftModule } from '@src/modules/shift/shift.module';
import { UserContractModule } from '@src/modules/user-contract/user-contract.module';
import { WorkingScheduleModule } from '@src/modules/working-schedule/working-schedule.module';
import { CreateLichLamViecService } from './commands/tao-lich-lam-viec/tao-lich-lam-viec.service';
import { LichLamViecRepository } from './database/lich-lam-viec.repository.prisma';
import { LICH_LAM_VIEC_REPOSITORY } from './lich-lam-viec.di-tokens';
import { CreateLichLamViecHttpController } from './commands/tao-lich-lam-viec/tao-lich-lam-viec.http.controller';

const httpControllers = [CreateLichLamViecHttpController];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [CreateLichLamViecService];

const queryHandlers: Provider[] = [];

const mappers: Provider[] = [];

const repositories: Provider[] = [
  {
    provide: LICH_LAM_VIEC_REPOSITORY,
    useClass: LichLamViecRepository,
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
