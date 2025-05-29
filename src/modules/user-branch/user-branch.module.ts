import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { USER_BRANCH_REPOSITORY } from './user-branch.di-tokens';
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
import { GenerateCode } from '@src/libs/utils/generate-code.util';

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
export class UserBranchModule {}
