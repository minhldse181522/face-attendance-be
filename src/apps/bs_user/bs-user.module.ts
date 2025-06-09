import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BS_USER_REPOSITORY } from './bs-user.di-tokens';
import { PrismaBsUserRepository } from './database/bs-user.repository.prisma';
import { BsUserMapper } from './mappers/bs-user.mapper';
import { FindUserWithActiveContractHttpController } from './queries/find-user-with-active-contract/find-user-with-active-contract.http.controller';
import { FindUserWithActiveContractQueryHandler } from './queries/find-user-with-active-contract/find-user-with-active-contract.query-handler';
import { FindFullUserInforHttpController } from './queries/find-full-user/find-full-user.http.controller';
import { FindFullUserInforQueryHandler } from './queries/find-full-user/find-full-user.query-handler';

const httpControllers = [
  FindUserWithActiveContractHttpController,
  FindFullUserInforHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [];

const queryHandlers: Provider[] = [
  FindUserWithActiveContractQueryHandler,
  FindFullUserInforQueryHandler,
];

const mappers: Provider[] = [BsUserMapper];

const repositories: Provider[] = [
  {
    provide: BS_USER_REPOSITORY,
    useClass: PrismaBsUserRepository,
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
export class BsUserModule {}
