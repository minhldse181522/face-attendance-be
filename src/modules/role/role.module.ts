import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaRoleRepository } from './database/role.repository.prisma';
import { RoleMapper } from './mappers/role.mapper';
import { FindRoleHttpController } from './queries/find-roles/find-roles.http.controller';
import { FindRoleQueryHandler } from './queries/find-roles/find-roles.query-handler';
import { ROLE_REPOSITORY } from './role.di-tokens';
import { CreateRoleHttpController } from './commands/create-role/create-role.http.controller';
import { UpdateRoleHttpController } from './commands/update-role/update-role.http.controller';
import { DeleteRoleHttpController } from './commands/delete-role/delete-branch.http.controller';
import { CreateRoleService } from './commands/create-role/create-role.service';
import { UpdateRoleService } from './commands/update-role/update-role.service';
import { DeleteRoleService } from './commands/delete-role/delete-branch.service';

const httpControllers = [
  FindRoleHttpController,
  CreateRoleHttpController,
  UpdateRoleHttpController,
  DeleteRoleHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateRoleService,
  UpdateRoleService,
  DeleteRoleService,
];

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
