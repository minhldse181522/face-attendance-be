import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { PayrollRepositoryPort } from '../../database/payroll.repository.port';
import { PayrollEntity } from '../../domain/payroll.entity';
import { PayrollNotFoundError } from '../../domain/payroll.error';
import { PAYROLL_REPOSITORY } from '../../payroll.di-tokens';

export class FindPayrollByParamsQuery extends PrismaQueryBase<Prisma.PayrollWhereInput> {}

export type FindPayrollByParamsQueryResult = Result<
  PayrollEntity,
  PayrollNotFoundError
>;

@QueryHandler(FindPayrollByParamsQuery)
export class FindPayrollByParamsQueryHandler {
  constructor(
    @Inject(PAYROLL_REPOSITORY)
    protected readonly payrollRepo: PayrollRepositoryPort,
  ) {}

  async execute(
    query: FindPayrollByParamsQuery,
  ): Promise<FindPayrollByParamsQueryResult> {
    const found = await this.payrollRepo.findPayrollByParams(query);
    if (found.isNone()) {
      return Err(new PayrollNotFoundError());
    }
    const payroll = found.unwrap();
    return Ok(payroll);
  }
}
