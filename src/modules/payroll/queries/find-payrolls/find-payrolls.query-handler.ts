import { Paginated } from '@libs/ddd';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryWithQuickSearchBase } from '@src/libs/ddd/prisma-query-with-quick-search.base';
import { Ok, Result } from 'oxide.ts';
import { PayrollRepositoryPort } from '../../database/payroll.repository.port';
import { PayrollEntity } from '../../domain/payroll.entity';
import { PAYROLL_REPOSITORY } from '../../payroll.di-tokens';
import { FindPayrollsRequestDto } from './find-payrolls.request.dto';

export class FindPayrollsQuery extends PrismaPaginatedQueryWithQuickSearchBase<Prisma.PayrollWhereInput> {
  quickSearch?: string | number;
  constructor(props: FindPayrollsRequestDto) {
    super(props.findOptions);
    Object.assign(this, props);
  }
}

export type FindPayrollsQueryResult = Result<Paginated<PayrollEntity>, void>;

@QueryHandler(FindPayrollsQuery)
export class FindPayrollsQueryHandler
  implements IQueryHandler<FindPayrollsQuery>
{
  constructor(
    @Inject(PAYROLL_REPOSITORY)
    protected readonly payrollRepo: PayrollRepositoryPort,
  ) {}

  async execute(query: FindPayrollsQuery): Promise<FindPayrollsQueryResult> {
    const result = await this.payrollRepo.findPaginatedWithQuickSearch(query);

    return Ok(
      new Paginated({
        data: result.data,
        count: result.count,
        limit: query.limit,
        page: query.page,
      }),
    );
  }
}
