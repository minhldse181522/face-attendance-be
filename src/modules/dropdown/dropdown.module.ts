import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BRANCH_REPOSITORY } from '../branch/branch.di-tokens';
import { BranchModule } from '../branch/branch.module';
import { PrismaBranchRepository } from '../branch/database/branch.repository.prisma';
import { PrismaRoleRepository } from '../role/database/role.repository.prisma';
import { ROLE_REPOSITORY } from '../role/role.di-tokens';
import { RoleModule } from '../role/role.module';
import { PrismaUserRepository } from '../user/database/user.repository.prisma';
import { USER_REPOSITORY } from '../user/user.di-tokens';
import { UserModule } from '../user/user.module';
import { PrismaDropDownRepository } from './database/dropdown.repository.prisma';
import { DROPDOWN_REPOSITORY } from './dropdown.di-tokens';
import { DropDownHttpController } from './find-dropdown/find-dropdown.http.controller';
import { FindDropdownQueryHandler } from './find-dropdown/find-dropdown.query-handler';
import { POSITION_REPOSITORY } from '../position/position.di-tokens';
import { PrismaPositionRepository } from '../position/database/position.repository.prisma';
import { PositionModule } from '../position/position.module';

const httpControllers = [DropDownHttpController];

const queryHandlers: Provider[] = [FindDropdownQueryHandler];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const repositories: Provider[] = [
  {
    provide: DROPDOWN_REPOSITORY,
    useClass: PrismaDropDownRepository,
  },
  {
    provide: ROLE_REPOSITORY,
    useClass: PrismaRoleRepository,
  },
  {
    provide: POSITION_REPOSITORY,
    useClass: PrismaPositionRepository,
  },
  {
    provide: USER_REPOSITORY,
    useClass: PrismaUserRepository,
  },
  {
    provide: BRANCH_REPOSITORY,
    useClass: PrismaBranchRepository,
  },
];

@Module({
  imports: [CqrsModule, BranchModule, UserModule, RoleModule, PositionModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...cliControllers,
    ...repositories,
    ...graphqlResolvers,
    ...queryHandlers,
  ],
  exports: [...repositories],
})
export class DropDownModule {}
