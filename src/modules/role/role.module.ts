import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaRoleRepository } from './database/role.repository.prisma';
import { RoleMapper } from './mappers/branch.mapper';
import { FindRoleHttpController } from './queries/find-roles/find-branches.http.controller';
import { FindRoleQueryHandler } from './queries/find-roles/find-branches.query-handler';
import { ROLE_REPOSITORY } from './role.di-tokens';

const httpControllers = [FindRoleHttpController];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [];

const queryHandlers: Provider[] = [FindRoleQueryHandler];

const mappers: Provider[] = [RoleMapper];

const repositories: Provider[] = [
  {
    provide: ROLE_REPOSITORY,
    useClass: PrismaRoleRepository,
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
export class RoleModule {}
