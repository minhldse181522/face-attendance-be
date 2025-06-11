import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { UserModule } from '../user/user.module';
import { CreateShiftHttpController } from './commands/create-shift/create-shift.http.controller';
import { CreateShiftService } from './commands/create-shift/create-shift.service';
import { DeleteShiftHttpController } from './commands/delete-shift/delete-shift.http.controller';
import { DeleteShiftService } from './commands/delete-shift/delete-shift.service';
import { UpdateShiftHttpController } from './commands/update-shift/update-shift.http.controller';
import { UpdateShiftService } from './commands/update-shift/update-shift.service';
import { PrismaShiftRepository } from './database/shift.repository.prisma';
import { ShiftMapper } from './mappers/shift.mapper';
import { FindShiftHttpController } from './queries/find-shifts/find-shifts.http.controller';
import { FindShiftQueryHandler } from './queries/find-shifts/find-shifts.query-handler';
import { SHIFT_REPOSITORY } from './shift.di-tokens';
import { FindShiftByParamsQueryHandler } from './queries/find-shift-by-params/find-shift-by-params.query-handler';

const httpControllers = [
  FindShiftHttpController,
  CreateShiftHttpController,
  UpdateShiftHttpController,
  DeleteShiftHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateShiftService,
  UpdateShiftService,
  DeleteShiftService,
];

const queryHandlers: Provider[] = [
  FindShiftQueryHandler,
  FindShiftByParamsQueryHandler,
];

const mappers: Provider[] = [ShiftMapper];

const repositories: Provider[] = [
  {
    provide: SHIFT_REPOSITORY,
    useClass: PrismaShiftRepository,
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
export class ShiftModule {}
