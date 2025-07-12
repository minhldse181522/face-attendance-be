import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Payroll as PayrollModel, Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { IField } from '@src/libs/utils';
import { None, Option, Some } from 'oxide.ts';
import { PayrollEntity } from '../domain/payroll.entity';
import { PayrollMapper } from '../mappers/payroll.mapper';
import { PayrollRepositoryPort } from './payroll.repository.port';

export const PayrollScalarFieldEnum = Prisma.PayrollScalarFieldEnum;

@Injectable()
export class PrismaPayrollRepository
  extends PrismaMultiTenantRepositoryBase<PayrollEntity, PayrollModel>
  implements PayrollRepositoryPort
{
  protected modelName = 'Payroll';
  constructor(
    private manager: PrismaClientManager,
    mapper: PayrollMapper,
  ) {
    super(manager, mapper);
  }

  async findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.PayrollWhereInput> & {
      fromDate?: string;
      toDate?: string;
      quickSearch?: string | number;
    },
  ): Promise<Paginated<PayrollEntity>> {
    const client = await this._getClient();
    const { quickSearch, page, limit, offset, orderBy, where = {} } = params;

    //#region Get condition from query
    const searchableFieldsEmf: IField[] = [
      { field: 'code', type: 'string' },
      { field: 'PayrollName', type: 'string' },
      { field: 'addressLine', type: 'string' },
      { field: 'placeId', type: 'string' },
      { field: 'city', type: 'string' },
      { field: 'district', type: 'string' },
      { field: 'lat', type: 'number' },
      { field: 'long', type: 'number' },
      { field: 'companyCode', type: 'string' },
    ];

    let searchConditions: Prisma.PayrollWhereInput =
      {} as Prisma.PayrollWhereInput;

    if (quickSearch) {
      searchConditions = this.createQuickSearchFilter(
        quickSearch,
        searchableFieldsEmf,
      );
    }
    //#endregion

    const [data, count] = await Promise.all([
      client.payroll.findMany({
        skip: offset,
        take: limit,
        where: {
          ...where,
          ...(searchConditions && {
            ...searchConditions,
          }),
        },
        orderBy,
      }),

      client.payroll.count({
        where: {
          ...where,
          ...(searchConditions && {
            ...searchConditions,
          }),
        },
      }),
    ]);

    return new Paginated({
      data: count > 0 ? data.map((item) => this.mapper.toDomain(item)) : [],
      count,
      limit,
      page,
    });
  }

  async findPayrollByParams(
    params: PrismaQueryBase<Prisma.PayrollWhereInput>,
  ): Promise<Option<PayrollEntity>> {
    const client = await this._getClient();
    const { where = {}, orderBy } = params;
    const result = await client.payroll.findFirst({
      where: { ...where },
      orderBy,
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }
}
