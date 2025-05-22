import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePositionHttpController } from './commands/create-position/create-position.http.controller';
import { CreatePositionService } from './commands/create-position/create-position.service';
import { DeletePositionHttpController } from './commands/delete-branch/delete-branch.http.controller';
import { DeletePositionService } from './commands/delete-branch/delete-branch.service';
import { UpdatePositionHttpController } from './commands/update-branch/update-branch.http.controller';
import { UpdatePositionService } from './commands/update-branch/update-branch.service';
import { PrismaPositionRepository } from './database/position.repository.prisma';
import { PositionMapper } from './mappers/position.mapper';
import { POSITION_REPOSITORY } from './position.di-tokens';
import { FindPositionHttpController } from './queries/find-positions/find-positions.http.controller';
import { FindPositionQueryHandler } from './queries/find-positions/find-positions.query-handler';

const httpControllers = [
  FindPositionHttpController,
  CreatePositionHttpController,
  UpdatePositionHttpController,
  DeletePositionHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreatePositionService,
  UpdatePositionService,
  DeletePositionService,
];

const queryHandlers: Provider[] = [FindPositionQueryHandler];

const mappers: Provider[] = [PositionMapper];

const repositories: Provider[] = [
  {
    provide: POSITION_REPOSITORY,
    useClass: PrismaPositionRepository,
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
  ],
  exports: [...repositories, ...mappers],
})
export class PositionModule {}
