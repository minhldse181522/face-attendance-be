import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { UserModule } from '../user/user.module';
import { CreateTimeKeepingHttpController } from './commands/create-time-keeping/create-time-keeping.http.controller';
import { CreateTimeKeepingService } from './commands/create-time-keeping/create-time-keeping.service';
import { DeleteTimeKeepingHttpController } from './commands/delete-time-keeping/delete-time-keeping.http.controller';
import { DeleteTimeKeepingService } from './commands/delete-time-keeping/delete-time-keeping.service';
import { UpdateTimeKeepingHttpController } from './commands/update-time-keeping/update-time-keeping.http.controller';
import { UpdateTimeKeepingService } from './commands/update-time-keeping/update-time-keeping.service';
import { PrismaTimeKeepingRepository } from './database/time-keeping.repository.prisma';
import { TimeKeepingMapper } from './mappers/time-keeping.mapper';
import { FindTimeKeepingHttpController } from './queries/find-time-keepings/find-time-keepings.http.controller';
import { FindTimeKeepingQueryHandler } from './queries/find-time-keepings/find-time-keepings.query-handler';
import { TIME_KEEPING_REPOSITORY } from './time-keeping.di-tokens';

const httpControllers = [
  FindTimeKeepingHttpController,
  CreateTimeKeepingHttpController,
  UpdateTimeKeepingHttpController,
  DeleteTimeKeepingHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateTimeKeepingService,
  UpdateTimeKeepingService,
  DeleteTimeKeepingService,
];

const queryHandlers: Provider[] = [FindTimeKeepingQueryHandler];

const mappers: Provider[] = [TimeKeepingMapper];

const repositories: Provider[] = [
  {
    provide: TIME_KEEPING_REPOSITORY,
    useClass: PrismaTimeKeepingRepository,
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
  exports: [...repositories, ...mappers],
})
export class TimeKeepingModule {}
