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
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';

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

  async findBangLuongByParamAndRole(
    params: PrismaPaginatedQueryBase<Prisma.PayrollWhereInput>,
    month?: string,
    userCode?: string,
  ): Promise<Paginated<PayrollEntity>> {
    const client = await this._getClient();
    const { limit, offset, page, where = {}, orderBy } = params;

    const user = RequestContextService.getRequestUser();
    const role = user?.roleCode;
    const currentUserCode = user?.code;
    const currentUsername = user?.userName;

    let finalWhere: Prisma.PayrollWhereInput = { ...where };

    if (role === 'R1') {
      // Admin - không lọc
    } else if (role === 'R2') {
      // Nếu là HR, lọc danh sách user được quản lý
      const contracts = await client.userContract.findMany({
        where: {
          managedBy: currentUsername,
          status: 'ACTIVE',
        },
        select: {
          userCode: true,
        },
      });

      const managedUserCodes = contracts
        .map((c) => c.userCode)
        .filter((code): code is string => code !== null);

      if (managedUserCodes.length === 0) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      finalWhere.userCode = {
        in: managedUserCodes,
      };
    } else if (role === 'R3') {
      // Lấy danh sách user theo chi nhánh của manager
      const currentUser = await client.user.findUnique({
        where: { code: currentUserCode },
        select: { addressCode: true },
      });

      if (!currentUser?.addressCode) {
        throw new Error('Không tìm thấy địa chỉ chi nhánh của người dùng');
      }

      const usersInSameBranch = await client.user.findMany({
        where: {
          addressCode: currentUser.addressCode,
        },
        select: {
          code: true,
        },
      });

      const userCodes = usersInSameBranch.map((u) => u.code);

      finalWhere.userCode = {
        in: userCodes,
      };
    } else if (role === 'R4') {
      // Staff chỉ xem được của chính mình
      finalWhere.userCode = currentUserCode;
    }

    if (month) {
      const normalizedMonth = String(Number(String(month).split('/')[0]));
      const yearPart = String(month).split('/')[1] ?? '';
      const finalMonth = yearPart
        ? `${normalizedMonth}/${yearPart}`
        : `${normalizedMonth}/`;

      finalWhere.month = {
        equals: finalMonth,
      };
    }

    const [data, count] = await Promise.all([
      client.payroll.findMany({
        skip: offset,
        take: limit,
        where: {
          ...finalWhere,
          userCode,
        },
        include: {
          user: true,
        },
        orderBy,
      }),

      client.payroll.count({
        where: {
          ...finalWhere,
          userCode,
        },
      }),
    ]);

    return new Paginated({
      data: data.map(this.mapper.toDomain),
      count,
      limit,
      page,
    });
  }
}
