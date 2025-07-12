import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { PrismaFormRepository } from '../form/database/form.repository.prisma';
import { FORM_REPOSITORY } from '../form/form.di-tokens';
import { FormModule } from '../form/form.module';
import { CreateFormDescriptionHttpController } from './commands/create-form-description/create-form-description.http.controller';
import { CreateFormDescriptionService } from './commands/create-form-description/create-form-description.service';
import { DeleteFormDescriptionHttpController } from './commands/delete-form-description/delete-form-description.http.controller';
import { DeleteFormDescriptionService } from './commands/delete-form-description/delete-form-description.service';
import { UpdateFormDescriptionHttpController } from './commands/update-form-description/update-form-description.http.controller';
import { UpdateFormDescriptionService } from './commands/update-form-description/update-form-description.service';
import { PrismaFormDescriptionRepository } from './database/form-description.repository.prisma';
import { FORM_DESCRIPTION_REPOSITORY } from './form-description.di-tokens';
import { FormDescriptionMapper } from './mappers/form-description.mapper';
import { FindFormDescriptionFilterHttpController } from './queries/find-form-descriptions-fiter/find-form-descriptions-fiter.http.controller';
import { FindFormDescriptionFiterQueryHandler } from './queries/find-form-descriptions-fiter/find-form-descriptions-fiter.query-handler';
import { FindFormDescriptionHttpController } from './queries/find-form-descriptions/find-form-descriptions.http.controller';
import { FindFormDescriptionQueryHandler } from './queries/find-form-descriptions/find-form-descriptions.query-handler';
import { FindManyFormDescriptionByParamsQueryHandler } from './queries/find-many-form-description-by-params/find-many-form-description-by-params.query-handler';

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
  FindManyFormDescriptionByParamsQueryHandler,
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
  exports: [...repositories, ...mappers, ...queryHandlers],
})
export class FormDescriptionModule {}
