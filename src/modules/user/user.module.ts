import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaUserRepository } from './database/user.repository.prisma';
import { UserMapper } from './mappers/user.mapper';
import { USER_REPOSITORY } from './user.di-tokens';
import { FindUserHttpController } from './queries/find-users/find-user.http.controller';
import { FindUserQueryHandler } from './queries/find-users/find-user.query-handler';
import { UpdateUserHttpController } from './commands/update-user/update-user.http.controller';
import { DeleteUserHttpController } from './commands/delete-user/delete-user.http.controller';
import { UpdateUserHandler } from './commands/update-user/update-user.handler';
import { DeleteUserHandler } from './commands/delete-user/delete-user.handler';

const httpControllers = [FindUserHttpController ,UpdateUserHttpController, DeleteUserHttpController];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [UpdateUserHandler,DeleteUserHandler];

const queryHandlers: Provider[] = [FindUserQueryHandler];

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
  exports: [...repositories, ...mappers],
})
export class UserModule {}
