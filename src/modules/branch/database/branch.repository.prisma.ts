import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Branch as BranchModel, Prisma } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { BranchEntity } from '../domain/branch.entity';
import { BranchMapper } from '../mappers/branch.mapper';
import { BranchRepositoryPort } from './branch.repository.port';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Paginated } from '@src/libs/ddd';
import { IField } from '@src/libs/utils';

export const BranchScalarFieldEnum = Prisma.BranchScalarFieldEnum;

@Injectable()
export class PrismaBranchRepository
  extends PrismaMultiTenantRepositoryBase<BranchEntity, BranchModel>
  implements BranchRepositoryPort
{
  protected modelName = 'branch';
  constructor(
    private manager: PrismaClientManager,
    mapper: BranchMapper,
  ) {
    super(manager, mapper);
  }

  async findBranchDropDown(): Promise<DropDownResult[]> {
    const client = await this._getClient();
    const result = await client.branch.findMany({
      select: {
        code: true,
        branchName: true,
      },
      orderBy: { code: 'asc' },
    });
    return result.map((item) => ({
      label: item.branchName,
      value: item.code,
    }));
  }

  async findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.BranchWhereInput> & {
      fromDate?: string;
      toDate?: string;
      quickSearch?: string | number;
    },
  ): Promise<Paginated<BranchEntity>> {
    const client = await this._getClient();
    const { quickSearch, page, limit, offset, orderBy, where = {} } = params;

    //#region Get condition from query
    const searchableFieldsEmf: IField[] = [
      { field: 'code', type: 'string' },
      { field: 'branchName', type: 'string' },
      { field: 'addressLine', type: 'string' },
      { field: 'placeId', type: 'string' },
      { field: 'city', type: 'string' },
      { field: 'district', type: 'string' },
      { field: 'lat', type: 'number' },
      { field: 'long', type: 'number' },
      { field: 'companyCode', type: 'string' },
    ];

    let searchConditions: Prisma.BranchWhereInput =
      {} as Prisma.BranchWhereInput;

    if (quickSearch) {
      searchConditions = this.createQuickSearchFilter(
        quickSearch,
        searchableFieldsEmf,
      );
    }
    //#endregion

    const [data, count] = await Promise.all([
      client.branch.findMany({
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

      client.branch.count({
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
}
