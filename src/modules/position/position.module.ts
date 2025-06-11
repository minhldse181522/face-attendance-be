import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';

import { CreatePositionHttpController } from './commands/create-position/create-position.http.controller';
import { CreatePositionService } from './commands/create-position/create-position.service';
import { DeletePositionHttpController } from './commands/delete-position/delete-position.http.controller';
import { DeletePositionService } from './commands/delete-position/delete-position.service';
import { UpdatePositionHttpController } from './commands/update-position/update-position.http.controller';
import { UpdatePositionService } from './commands/update-position/update-position.service';
import { PrismaPositionRepository } from './database/position.repository.prisma';
import { PositionMapper } from './mappers/position.mapper';
import { FindPositionHttpController } from './queries/find-positions/find-positions.http.controller';
import { FindPositionQueryHandler } from './queries/find-positions/find-positions.query-handler';
import { POSITION_REPOSITORY } from './position.di-tokens';

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

const utils: Provider[] = [GenerateCode];

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
    ...utils,
  ],
  exports: [...repositories, ...mappers],
})
export class PositionModule {}
