import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { PrismaFormDescriptionRepository } from '@src/modules/form-description/database/form-description.repository.prisma';
import { FORM_DESCRIPTION_REPOSITORY } from '@src/modules/form-description/form-description.di-tokens';
import { FormDescriptionModule } from '@src/modules/form-description/form-description.module';
import { PrismaTimeKeepingRepository } from '@src/modules/time-keeping/database/time-keeping.repository.prisma';
import { TIME_KEEPING_REPOSITORY } from '@src/modules/time-keeping/time-keeping.di-tokens';
import { TimeKeepingModule } from '@src/modules/time-keeping/time-keeping.module';
import { USER_CONTRACT_REPOSITORY } from '@src/modules/user-contract/user-contract.di-tokens';
import { UserContractModule } from '@src/modules/user-contract/user-contract.module';
import { PrismaWorkingScheduleRepository } from '@src/modules/working-schedule/database/working-schedule.repository.prisma';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { WorkingScheduleModule } from '@src/modules/working-schedule/working-schedule.module';
import { PrismaUserContractRepository } from '../bs-user-contract/database/user-contract.repository.prisma';
import { UserContractMapper } from '../bs-user-contract/mappers/user-contract.mapper';
import { BANG_LUONG_REPOSITORY } from './bang-luong.di-tokens';
import { TinhBangLuongCronService } from './commands/tinh-bang-luong/tinh-bang-luong.cron.service';
import { BangLuongRepository } from './database/bang-luong.repository.prisma';
import { BangLuongMapper } from './mappers/bang-luong.mapper';

const httpControllers = [];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [TinhBangLuongCronService];

const queryHandlers: Provider[] = [];

const mappers: Provider[] = [BangLuongMapper, UserContractMapper];

const repositories: Provider[] = [
  {
    provide: BANG_LUONG_REPOSITORY,
    useClass: BangLuongRepository,
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
    provide: USER_CONTRACT_REPOSITORY,
    useClass: PrismaUserContractRepository,
  },
  {
    provide: FORM_DESCRIPTION_REPOSITORY,
    useClass: PrismaFormDescriptionRepository,
  },
];

const utilities: Provider[] = [GenerateCode];

@Module({
  imports: [
    CqrsModule,
    UserContractModule,
    WorkingScheduleModule,
    TimeKeepingModule,
    FormDescriptionModule,
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
export class BangLuongModule {}
