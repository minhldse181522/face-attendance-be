import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FormDescriptionMapper } from './mappers/form-description.mapper';
import { FORM_DESCRIPTION_REPOSITORY } from './form-description.di-tokens';
import { PrismaFormDescriptionRepository } from './database/form-description.repository.prisma';
import { FindFormDescriptionHttpController } from './queries/find-form-descriptions/find-form-descriptions.http.controller';
import { FindFormDescriptionQueryHandler } from './queries/find-form-descriptions/find-form-descriptions.query-handler';
import { UpdateFormDescriptionHttpController } from './commands/update-form-description/update-form-description.http.controller';
import { UpdateFormDescriptionService } from './commands/update-form-description/update-form-description.service';
import { DeleteFormDescriptionHttpController } from './commands/delete-form-description/delete-form-description.http.controller';
import { DeleteFormDescriptionService } from './commands/delete-form-description/delete-form-description.service';
import { CreateFormDescriptionHttpController } from './commands/create-form-description/create-form-description.http.controller';
import { CreateFormDescriptionService } from './commands/create-form-description/create-form-description.service';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { FORM_REPOSITORY } from '../form/form.di-tokens';
import { PrismaFormRepository } from '../form/database/form.repository.prisma';
import { FormModule } from '../form/form.module';
import { FindFormDescriptionFilterHttpController } from './queries/find-form-descriptions-fiter/find-form-descriptions-fiter.http.controller';
import { FindFormDescriptionFiterQueryHandler } from './queries/find-form-descriptions-fiter/find-form-descriptions-fiter.query-handler';

const httpControllers = [
  FindFormDescriptionFilterHttpController,
  FindFormDescriptionHttpController,
  UpdateFormDescriptionHttpController,
  DeleteFormDescriptionHttpController,
  CreateFormDescriptionHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  UpdateFormDescriptionService,
  DeleteFormDescriptionService,
  CreateFormDescriptionService,
];

const queryHandlers: Provider[] = [
  FindFormDescriptionQueryHandler,
  FindFormDescriptionFiterQueryHandler,
];

const mappers: Provider[] = [FormDescriptionMapper];
const utils: Provider[] = [GenerateCode];

const repositories: Provider[] = [
  {
    provide: FORM_DESCRIPTION_REPOSITORY,
    useClass: PrismaFormDescriptionRepository,
  },
  {
    provide: FORM_REPOSITORY,
    useClass: PrismaFormRepository,
  },
];

@Module({
  imports: [CqrsModule, FormModule],
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
export class FormDescriptionModule {}
