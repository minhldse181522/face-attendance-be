import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { Option } from 'oxide.ts';
import { PayrollEntity } from '../domain/payroll.entity';

export interface PayrollRepositoryPort extends RepositoryPort<PayrollEntity> {
  findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.PayrollWhereInput> & {
      quickSearch?: string | number;
    },
  ): Promise<Paginated<PayrollEntity>>;
  findPayrollByParams(
    params: PrismaQueryBase<Prisma.PayrollWhereInput>,
  ): Promise<Option<PayrollEntity>>;
  findBangLuongByParamAndRole(
    params: PrismaPaginatedQueryBase<Prisma.PayrollWhereInput>,
    month?: string,
    userCode?: string,
  ): Promise<Paginated<PayrollEntity>>;
}
