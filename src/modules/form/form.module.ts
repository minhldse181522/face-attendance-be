import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FormMapper } from './mappers/form.mapper';
import { FORM_REPOSITORY } from './form.di-tokens';
import { PrismaFormRepository } from './database/form.repository.prisma';
import { FindFormHttpController } from './queries/find-forms/find-forms.http.controller';
import { FindFormQueryHandler } from './queries/find-forms/find-forms.query-handler';
import { CreateFormHttpController } from './commands/create-form/create-form.http.controller';
import { CreateFormService } from './commands/create-form/create-form.service';
import { UpdateFormHttpController } from './commands/update-form/update-form.http.controller';
import { UpdateFormService } from './commands/update-form/update-form.service';
import { DeleteFormHttpController } from './commands/delete-form/delete-form.http.controller';
import { DeleteFormService } from './commands/delete-form/delete-form.service';

const httpControllers = [
  FindFormHttpController,
  CreateFormHttpController,
  UpdateFormHttpController,
  DeleteFormHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateFormService,
  UpdateFormService,
  DeleteFormService,
];

const queryHandlers: Provider[] = [FindFormQueryHandler];

const mappers: Provider[] = [FormMapper];

const repositories: Provider[] = [
  {
    provide: FORM_REPOSITORY,
    useClass: PrismaFormRepository,
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
export class FormModule {}
