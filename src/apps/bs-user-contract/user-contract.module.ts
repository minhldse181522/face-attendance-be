import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { UserModule } from '@src/modules/user/user.module';
import { CreateUserContractHttpController } from './commands/create-user-contract/create-user-contract.http.controller';
import { CreateUserContractService } from './commands/create-user-contract/create-user-contract.service';
import { PrismaUserContractRepository } from './database/user-contract.repository.prisma';
import { UserContractMapper } from './mappers/user-contract.mapper';
import { FindUserContractsByUserCodeHttpController } from './queries/find-user-contracts-by-usercode/find-user-contracts-by-usercode.http.controller';
import { FindUserContractsByUserCodeQueryHandler } from './queries/find-user-contracts-by-usercode/find-user-contracts-by-usercode.query-handler';
import { BS_USER_CONTRACT_REPOSITORY } from './user-contract.di-tokens';
import { FindUserContractsByUserCodeArrayHttpController } from './queries/find-user-contract-by-usercode-array/find-user-contract-by-usercode-array.http.controller';
import { FindUserContractsByUserCodeArrayQueryHandler } from './queries/find-user-contract-by-usercode-array/find-user-contract-by-usercode-array.query-handler';

const httpControllers = [
  CreateUserContractHttpController,
  FindUserContractsByUserCodeHttpController,
  FindUserContractsByUserCodeArrayHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [CreateUserContractService];

const queryHandlers: Provider[] = [
  FindUserContractsByUserCodeQueryHandler,
  FindUserContractsByUserCodeArrayQueryHandler,
];

const mappers: Provider[] = [UserContractMapper];

const repositories: Provider[] = [
  {
    provide: BS_USER_CONTRACT_REPOSITORY, // Changed from BS_USER_REPOSITORY to BS_USER_CONTRACT_REPOSITORY
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
export class BsUserContractModule {}
