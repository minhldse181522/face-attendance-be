import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { ReportRepository } from './database/report.repository.prisma';
import { ReportMapper } from './mappers/report.mapper';
import { FindReportHttpController } from './queries/find-report/find-report.http.controller';
import { FindReportQueryHandler } from './queries/find-report/find-report.query-handler';
import { REPORT_REPOSITORY } from './report.di-tokens';

const httpControllers = [FindReportHttpController];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [];

const queryHandlers: Provider[] = [FindReportQueryHandler];

const mappers: Provider[] = [ReportMapper];

const repositories: Provider[] = [
  {
    provide: REPORT_REPOSITORY,
    useClass: ReportRepository,
  },
];

const utilities: Provider[] = [GenerateCode];

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
    ...utilities,
  ],
  exports: [...repositories, ...mappers],
})
export class ReportModule {}
