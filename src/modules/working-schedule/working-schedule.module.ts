import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { UserModule } from '../user/user.module';
import { CreateWorkingScheduleHttpController } from './commands/create-working-schedule/create-working-schedule.http.controller';
import { CreateWorkingScheduleService } from './commands/create-working-schedule/create-working-schedule.service';
import { DeleteWorkingScheduleHttpController } from './commands/delete-working-schedule/delete-working-schedule.http.controller';
import { DeleteWorkingScheduleService } from './commands/delete-working-schedule/delete-working-schedule.service';
import { UpdateWorkingScheduleHttpController } from './commands/update-working-schedule/update-working-schedule.http.controller';
import { UpdateWorkingScheduleService } from './commands/update-working-schedule/update-working-schedule.service';
import { PrismaWorkingScheduleRepository } from './database/working-schedule.repository.prisma';
import { WorkingScheduleMapper } from './mappers/working-schedule.mapper';
import { FindWorkingScheduleArrayByParamsQueryHandler } from './queries/find-working-schedule-array-by-params/find-working-schedule-array-by-params.query-handler';
import { FindWorkingScheduleArrayStatusByParamsQueryHandler } from './queries/find-working-schedule-array-status-by-params/find-working-schedule-array-status-by-params.query-handler';
import { FindWorkingScheduleArrayStopByParamsQueryHandler } from './queries/find-working-schedule-array-stop-by-params/find-working-schedule-array-stop-by-params.query-handler';
import { FindWorkingScheduleByParamsQueryHandler } from './queries/find-working-schedule-by-params/find-working-schedule-by-params.query-handler';
import { FindWorkingScheduleHttpController } from './queries/find-working-schedules/find-working-schedules.http.controller';
import { FindWorkingScheduleQueryHandler } from './queries/find-working-schedules/find-wroking-schedules.query-handler';
import { WORKING_SCHEDULE_REPOSITORY } from './working-schedule.di-tokens';

const httpControllers = [
  FindWorkingScheduleHttpController,
  CreateWorkingScheduleHttpController,
  UpdateWorkingScheduleHttpController,
  DeleteWorkingScheduleHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateWorkingScheduleService,
  UpdateWorkingScheduleService,
  DeleteWorkingScheduleService,
];

const queryHandlers: Provider[] = [
  FindWorkingScheduleQueryHandler,
  FindWorkingScheduleByParamsQueryHandler,
  FindWorkingScheduleArrayByParamsQueryHandler,
  FindWorkingScheduleArrayStopByParamsQueryHandler,
  FindWorkingScheduleArrayStatusByParamsQueryHandler,
];

const mappers: Provider[] = [WorkingScheduleMapper];

const repositories: Provider[] = [
  {
    provide: WORKING_SCHEDULE_REPOSITORY,
    useClass: PrismaWorkingScheduleRepository,
  },
];

const utilities: Provider[] = [GenerateCode];

@Module({
  imports: [CqrsModule, UserModule],
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
  exports: [...repositories, ...mappers, ...queryHandlers],
})
export class WorkingScheduleModule {}
