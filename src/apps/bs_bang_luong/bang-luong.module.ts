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
import { FindBangLuongHttpController } from './queries/find-bang-luong/find-bang-luong.http.controller';
import { FindBangLuongQueryHandler } from './queries/find-bang-luong/find-bang-luong.query-handler';
import { PAYROLL_REPOSITORY } from '@src/modules/payroll/payroll.di-tokens';
import { PrismaPayrollRepository } from '@src/modules/payroll/database/payroll.repository.prisma';
import { PayrollModule } from '@src/modules/payroll/payroll.module';
import { ThanhToanLuongHttpController } from './commands/thanh-toan-luong/thanh-toan-luong.http.controller';
import { ThanhToanLuongService } from './commands/thanh-toan-luong/thanh-toan-luong.service';
import { PayrollMapper } from '@src/modules/payroll/mappers/payroll.mapper';

const httpControllers = [
  FindBangLuongHttpController,
  ThanhToanLuongHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  TinhBangLuongCronService,
  ThanhToanLuongService,
];

const queryHandlers: Provider[] = [FindBangLuongQueryHandler];

const mappers: Provider[] = [
  BangLuongMapper,
  UserContractMapper,
  PayrollMapper,
];

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
  {
    provide: PAYROLL_REPOSITORY,
    useClass: PrismaPayrollRepository,
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
    PayrollModule,
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
