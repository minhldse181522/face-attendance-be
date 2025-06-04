import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaUserContractRepository } from './database/user-contract.repository.prisma';
import { UserContractMapper } from './mappers/user-contract.mapper';
import { FindUserContractHttpController } from './queries/find-user-contracts/find-user-contracts.http.controller';
import { FindUserContractQueryHandler } from './queries/find-user-contracts/find-user-contracts.query-handler';
import { USER_CONTRACT_REPOSITORY } from './user-contract.di-tokens';
import { CreateUserContractHttpController } from './commands/create-user-contract/create-user-contract.http.controller';
import { UpdateUserContractHttpController } from './commands/update-user-contract/update-user-contract.http.controller';
import { DeleteUserContractHttpController } from './commands/delete-user-contract/delete-user-contract.http.controller';
import { CreateUserContractService } from './commands/create-user-contract/create-user-contract.service';
import { UpdateUserContractService } from './commands/update-user-contract/update-user-contract.service';
import { DeleteUserContractService } from './commands/delete-user-contract/delete-user-contract.service';
import { FindUserContractByIdHttpController } from './queries/find-user-contract-by-id/find-user-contract-by-id.http.controller';
import { FindUserContractByIdQueryHandler } from './queries/find-user-contract-by-id/find-user-contract-by-id.query-handler';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { FindUserContractsByUserCodeHttpController } from './queries/find-user-contracts-by-usercode/find-user-contracts-by-usercode.http.controller';
import { FindUserContractsByUserCodeQueryHandler } from './queries/find-user-contracts-by-usercode/find-user-contracts-by-usercode.query-handler';
import { UserModule } from '../user/user.module';
const httpControllers = [
  FindUserContractHttpController,
  FindUserContractByIdHttpController,
  CreateUserContractHttpController,
  UpdateUserContractHttpController,
  DeleteUserContractHttpController,
  FindUserContractsByUserCodeHttpController, // Add the new controller
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateUserContractService,
  UpdateUserContractService,
  DeleteUserContractService,
];

const queryHandlers: Provider[] = [
  FindUserContractQueryHandler,
  FindUserContractByIdQueryHandler,
  FindUserContractsByUserCodeQueryHandler, // Add the new query handler
];

const mappers: Provider[] = [UserContractMapper];

const repositories: Provider[] = [
  {
    provide: USER_CONTRACT_REPOSITORY,
    useClass: PrismaUserContractRepository,
  },
];

const utilities: Provider[] = [GenerateCode];

@Module({
  imports: [CqrsModule, UserModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...cliControllers,
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
    ...utilities,
  ],
  exports: [...repositories, ...mappers],
})
export class UserContractModule {}
