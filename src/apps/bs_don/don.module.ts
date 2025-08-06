import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MinioModule } from '@src/libs/minio/minio.module';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { PrismaFormDescriptionRepository } from '@src/modules/form-description/database/form-description.repository.prisma';
import { FORM_DESCRIPTION_REPOSITORY } from '@src/modules/form-description/form-description.di-tokens';
import { FormDescriptionModule } from '@src/modules/form-description/form-description.module';
import { FormDescriptionMapper } from '@src/modules/form-description/mappers/form-description.mapper';
import { BsUserContractModule } from '@src/apps/bs-user-contract/user-contract.module';
import { XuLiDonHttpController } from './commands/tao-don/tao-don.http.controller';
import { TaoDonService } from './commands/tao-don/tao-don.service';

const httpControllers = [XuLiDonHttpController];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [TaoDonService];

const queryHandlers: Provider[] = [];

const mappers: Provider[] = [FormDescriptionMapper];

const repositories: Provider[] = [
  {
    provide: FORM_DESCRIPTION_REPOSITORY,
    useClass: PrismaFormDescriptionRepository,
  },
];

const utilities: Provider[] = [GenerateCode];

@Module({
  imports: [CqrsModule, FormDescriptionModule, BsUserContractModule],
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
export class DonModule {}
