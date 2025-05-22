import { Logger, Module, Provider } from '@nestjs/common';
import { DropDownHttpController } from './find-dropdown/find-dropdown.http.controller';
import { FindDropdownQueryHandler } from './find-dropdown/find-dropdown.query-handler';
import { DROPDOWN_REPOSITORY } from './dropdown.di-tokens';
import { PrismaDropDownRepository } from './database/dropdown.repository.prisma';
import { CqrsModule } from '@nestjs/cqrs';
import { BranchModule } from '../branch/branch.module';
import { PositionModule } from '../position/position.module';
import { POSITION_REPOSITORY } from '../position/position.di-tokens';
import { PrismaPositionRepository } from '../position/database/position.repository.prisma';
import { BRANCH_REPOSITORY } from '../branch/branch.di-tokens';
import { PrismaBranchRepository } from '../branch/database/branch.repository.prisma';
import { USER_REPOSITORY } from '../user/user.di-tokens';
import { PrismaUserRepository } from '../user/database/user.repository.prisma';
import { UserModule } from '../user/user.module';

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
    provide: USER_REPOSITORY,
    useClass: PrismaUserRepository,
  },
  {
    provide: POSITION_REPOSITORY,
    useClass: PrismaPositionRepository,
  },
  {
    provide: BRANCH_REPOSITORY,
    useClass: PrismaBranchRepository,
  },
];

@Module({
  imports: [CqrsModule, BranchModule, PositionModule, UserModule],
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
