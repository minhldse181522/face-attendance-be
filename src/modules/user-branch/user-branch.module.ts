import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { CreateUserBranchHttpController } from './commands/create-user-branch/create-user-branch.http.controller';
import { CreateUserBranchService } from './commands/create-user-branch/create-user-branch.service';
import { DeleteUserBranchHttpController } from './commands/delete-user-branch/delete-user-branch.http.controller';
import { DeleteUserBranchService } from './commands/delete-user-branch/delete-user-branch.service';
import { UpdateUserBranchHttpController } from './commands/update-user-branch/update-user-branch.http.controller';
import { UpdateUserBranchService } from './commands/update-user-branch/update-user-branch.service';
import { PrismaUserBranchRepository } from './database/user-branch.repository.prisma';
import { UserBranchMapper } from './mappers/user-branch.mapper';
import { FindUserBranchesHttpController } from './queries/find-user-branches/find-user-branches.http.controller';
import { FindUserBranchesQueryHandler } from './queries/find-user-branches/find-user-branches.query-handler';
import { USER_BRANCH_REPOSITORY } from './user-branch.di-tokens';
import { UserContractModule } from '../user-contract/user-contract.module';
import { USER_CONTRACT_REPOSITORY } from '../user-contract/user-contract.di-tokens';
import { PrismaUserContractRepository } from '../user-contract/database/user-contract.repository.prisma';
import { BRANCH_REPOSITORY } from '../branch/branch.di-tokens';
import { PrismaBranchRepository } from '../branch/database/branch.repository.prisma';
import { BranchModule } from '../branch/branch.module';

const httpControllers = [
  FindUserBranchesHttpController,
  CreateUserBranchHttpController,
  UpdateUserBranchHttpController,
  DeleteUserBranchHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateUserBranchService,
  UpdateUserBranchService,
  DeleteUserBranchService,
];

const queryHandlers: Provider[] = [FindUserBranchesQueryHandler];

const mappers: Provider[] = [UserBranchMapper];

const utils: Provider[] = [GenerateCode];

const repositories: Provider[] = [
  {
    provide: USER_BRANCH_REPOSITORY,
    useClass: PrismaUserBranchRepository,
  },
  {
    provide: BRANCH_REPOSITORY,
    useClass: PrismaBranchRepository,
  },
  {
    provide: USER_CONTRACT_REPOSITORY,
    useClass: PrismaUserContractRepository,
  },
];

@Module({
  imports: [CqrsModule, UserContractModule, BranchModule],
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
export class UserBranchModule {}
