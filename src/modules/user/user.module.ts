import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserHttpController } from './commands/delete-user/delete-user.http.controller';
import { DeleteUserService } from './commands/delete-user/delete-user.service';
import { UpdateUserHttpController } from './commands/update-user/update-user.http.controller';
import { UpdateUserService } from './commands/update-user/update-user.service';
import { PrismaUserRepository } from './database/user.repository.prisma';
import { UserMapper } from './mappers/user.mapper';
import { FindUserHttpController } from './queries/find-users/find-user.http.controller';
import { FindUserQueryHandler } from './queries/find-users/find-user.query-handler';
import { USER_REPOSITORY } from './user.di-tokens';
import { FindUserByParamsQueryHandler } from './queries/find-user-by-params/find-user-by-params.query-handler';

const httpControllers = [
  FindUserHttpController,
  UpdateUserHttpController,
  DeleteUserHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [UpdateUserService, DeleteUserService];

const queryHandlers: Provider[] = [
  FindUserQueryHandler,
  FindUserByParamsQueryHandler,
];

const mappers: Provider[] = [UserMapper];

const repositories: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: PrismaUserRepository,
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
  exports: [...repositories, ...mappers, ...queryHandlers],
})
export class UserModule {}
