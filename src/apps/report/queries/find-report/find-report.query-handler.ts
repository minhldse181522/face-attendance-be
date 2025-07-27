import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Ok, Result } from 'oxide.ts';
import {
  FindReportParams,
  FindReportResult,
  ReportRepositoryPort,
} from '../../database/report.repository.port';
import { REPORT_REPOSITORY } from '../../report.di-tokens';

export class FindReportQuery {
  month?: string;

  constructor(queryParams: FindReportParams) {
    Object.assign(this, queryParams);
  }
}

export type FindReportQueryResult = Result<FindReportResult, any>;

@QueryHandler(FindReportQuery)
export class FindReportQueryHandler
  implements IQueryHandler<FindReportQuery, FindReportQueryResult>
{
  constructor(
    @Inject(REPORT_REPOSITORY)
    protected readonly reportRepo: ReportRepositoryPort,
  ) {}

  async execute(query: FindReportQuery): Promise<FindReportQueryResult> {
    const result = await this.reportRepo.findReport(query);

    return Ok(result);
  }
}
