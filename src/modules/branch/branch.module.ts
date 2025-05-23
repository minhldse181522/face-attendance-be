import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BRANCH_REPOSITORY } from './branch.di-tokens';
import { PrismaBranchRepository } from './database/branch.repository.prisma';
import { BranchMapper } from './mappers/branch.mapper';
import { FindBranchHttpController } from './queries/find-branches/find-branches.http.controller';
import { FindBranchQueryHandler } from './queries/find-branches/find-branches.query-handler';
import { CreateBranchHttpController } from './commands/create-branch/create-branch.http.controller';
import { UpdateBranchHttpController } from './commands/update-branch/update-branch.http.controller';
import { DeleteBranchHttpController } from './commands/delete-branch/delete-branch.http.controller';
import { CreateBranchService } from './commands/create-branch/create-branch.service';
import { UpdateBranchService } from './commands/update-branch/update-branch.service';
import { DeleteBranchService } from './commands/delete-branch/delete-branch.service';

const httpControllers = [
  FindBranchHttpController,
  CreateBranchHttpController,
  UpdateBranchHttpController,
  DeleteBranchHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateBranchService,
  UpdateBranchService,
  DeleteBranchService,
];

const queryHandlers: Provider[] = [FindBranchQueryHandler];

const mappers: Provider[] = [BranchMapper];

const repositories: Provider[] = [
  {
    provide: BRANCH_REPOSITORY,
    useClass: PrismaBranchRepository,
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
export class BranchModule {}
