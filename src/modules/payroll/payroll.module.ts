import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { CreatePayrollHttpController } from './commands/create-payroll/create-payroll.http.controller';
import { CreatePayrollService } from './commands/create-payroll/create-payroll.service';
import { UpdatePayrollHttpController } from './commands/update-payroll/update-payroll.http.controller';
import { UpdatePayrollService } from './commands/update-payroll/update-payroll.service';
import { PrismaPayrollRepository } from './database/payroll.repository.prisma';
import { PayrollMapper } from './mappers/payroll.mapper';
import { PAYROLL_REPOSITORY } from './payroll.di-tokens';
import { FindPayrollsHttpController } from './queries/find-payrolls/find-payrolls.http.controller';
import { FindPayrollsQueryHandler } from './queries/find-payrolls/find-payrolls.query-handler';

const httpControllers = [
  FindPayrollsHttpController,
  CreatePayrollHttpController,
  UpdatePayrollHttpController,
  // DeleteBranchHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreatePayrollService,
  UpdatePayrollService,
  // DeleteBranchService,
];

const queryHandlers: Provider[] = [FindPayrollsQueryHandler];

const mappers: Provider[] = [PayrollMapper];

const utils: Provider[] = [GenerateCode];

const repositories: Provider[] = [
  {
    provide: PAYROLL_REPOSITORY,
    useClass: PrismaPayrollRepository,
  },
];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...cliControllers,
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
    ...utils,
  ],
  exports: [...repositories, ...mappers],
})
export class PayrollModule {}
