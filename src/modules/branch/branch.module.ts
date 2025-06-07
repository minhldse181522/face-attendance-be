import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BRANCH_REPOSITORY } from './branch.di-tokens';
import { CreateBranchHttpController } from './commands/create-branch/create-branch.http.controller';
import { CreateBranchService } from './commands/create-branch/create-branch.service';
import { DeleteBranchHttpController } from './commands/delete-branch/delete-branch.http.controller';
import { DeleteBranchService } from './commands/delete-branch/delete-branch.service';
import { UpdateBranchHttpController } from './commands/update-branch/update-branch.http.controller';
import { UpdateBranchService } from './commands/update-branch/update-branch.service';
import { PrismaBranchRepository } from './database/branch.repository.prisma';
import { BranchMapper } from './mappers/branch.mapper';
import { FindBranchsHttpController } from './queries/find-branches/find-branches.http.controller';
import { FindBranchsQueryHandler } from './queries/find-branches/find-branches.query-handler';
import { GenerateCode } from '@src/libs/utils/generate-code.util';

const httpControllers = [
  FindBranchsHttpController,
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

const queryHandlers: Provider[] = [FindBranchsQueryHandler];

const mappers: Provider[] = [BranchMapper];

const utils: Provider[] = [GenerateCode];

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
    ...utils,
  ],
  exports: [...repositories, ...mappers],
})
export class BranchModule {}
