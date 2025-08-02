import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { UserBranch as UserBranchModel, Prisma } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { UserBranchEntity } from '../domain/user-branch.entity';
import { UserBranchMapper } from '../mappers/user-branch.mapper';
import { UserBranchRepositoryPort } from './user-branch.repository.port';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { Paginated } from '@src/libs/ddd';
import { IField } from '@src/libs/utils';
import { None, Option, Some } from 'oxide.ts';

export const UserBranchScalarFieldEnum = Prisma.UserBranchScalarFieldEnum;

@Injectable()
export class PrismaUserBranchRepository
  extends PrismaMultiTenantRepositoryBase<UserBranchEntity, UserBranchModel>
  implements UserBranchRepositoryPort
{
  protected modelName = 'userBranch';
  constructor(
    private manager: PrismaClientManager,
    mapper: UserBranchMapper,
  ) {
    super(manager, mapper);
  }

  async findUserBranchDropDown(): Promise<DropDownResult[]> {
    const client = await this._getClient();
    const result = await client.userBranch.findMany({
      select: {
        code: true,
        branch: {
          select: {
            branchName: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
    return result.map((item) => ({
      label: `${item.branch?.branchName}`,
      value: item.code,
    }));
  }

  async findUserBranchByBranchCode(
    branchCode: string,
  ): Promise<UserBranchEntity[]> {
    const client = await this._getClient();
    const results = await client.userBranch.findMany({
      where: { branchCode },
      include: {
        branch: true,
        userContract: true,
      },
    });
    return results.map((item) => this.mapper.toDomain(item));
  }

  async findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.UserBranchWhereInput> & {
      fromDate?: string;
      toDate?: string;
      quickSearch?: string | number;
    },
  ): Promise<Paginated<UserBranchEntity>> {
    const client = await this._getClient();
    const { quickSearch, page, limit, offset, orderBy, where = {} } = params;

    // Define searchable fields
    const searchableFieldsUB: IField[] = [
      { field: 'code', type: 'string' },
      { field: 'branchCode', type: 'string' },
      { field: 'userContractCode', type: 'string' },
    ];

    // Define searchable fields for branch
    const searchableFieldsBranch: IField[] = [
      { field: 'branchName', type: 'string' },
      { field: 'city', type: 'string' },
      { field: 'district', type: 'string' },
    ];

    let searchConditions: Prisma.UserBranchWhereInput = {};

    if (quickSearch) {
      // Search in UserBranch fields
      const userBranchConditions = this.createQuickSearchFilter(
        quickSearch,
        searchableFieldsUB,
      );

      // Build complete search conditions
      searchConditions = {
        OR: [
          { ...userBranchConditions },
          {
            branch: {
              OR: searchableFieldsBranch.map((field) => ({
                [field.field]: {
                  contains: String(quickSearch),
                  mode: 'insensitive',
                },
              })),
            },
          },
        ],
      };
    }

    const [data, count] = await Promise.all([
      client.userBranch.findMany({
        skip: offset,
        take: limit,
        where: {
          ...where,
          ...(Object.keys(searchConditions).length > 0 ? searchConditions : {}),
        },
        orderBy,
        include: {
          branch: true,
          userContract: {
            select: {
              code: true,
              title: true,
              status: true,
            },
          },
        },
      }),

      client.userBranch.count({
        where: {
          ...where,
          ...(Object.keys(searchConditions).length > 0 ? searchConditions : {}),
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

  async findUserBranchByParams(
    params: PrismaQueryBase<Prisma.UserBranchWhereInput>,
  ): Promise<Option<UserBranchEntity>> {
    const client = await this._getClient();
    const { where = {}, orderBy } = params;
    const result = await client.userBranch.findFirst({
      where: { ...where },
      orderBy,
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }
}
