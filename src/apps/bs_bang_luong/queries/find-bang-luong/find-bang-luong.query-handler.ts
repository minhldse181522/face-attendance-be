import { GeneratedFindOptions } from '@chax-at/prisma-filter';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { PayrollRepositoryPort } from '@src/modules/payroll/database/payroll.repository.port';
import { PayrollEntity } from '@src/modules/payroll/domain/payroll.entity';
import { PAYROLL_REPOSITORY } from '@src/modules/payroll/payroll.di-tokens';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { Ok, Result } from 'oxide.ts';

export class FindBangLuongQuery extends PrismaPaginatedQueryBase<Prisma.PayrollWhereInput> {
  month?: number;
  userCode?: string;
  constructor(
    props: GeneratedFindOptions<Prisma.PayrollWhereInput> & {
      month?: number;
      userCode?: string;
    },
  ) {
    super(props);
    this.month = props.month;
    this.userCode = props.userCode;
  }
}

export type FindBangLuongQueryResult = Result<Paginated<PayrollEntity>, void>;

@QueryHandler(FindBangLuongQuery)
export class FindBangLuongQueryHandler {
  constructor(
    @Inject(PAYROLL_REPOSITORY)
    protected readonly payrollRepo: PayrollRepositoryPort,
  ) {}

  async execute(query: FindBangLuongQuery): Promise<FindBangLuongQueryResult> {
    const result = await this.payrollRepo.findBangLuongByParamAndRole(
      {
        ...query,
      },
      query.month,
      query.userCode,
    );

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
