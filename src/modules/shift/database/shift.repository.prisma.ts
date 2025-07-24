import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Prisma, Shift as ShiftModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { ShiftEntity } from '../domain/shift.entity';
import { ShiftMapper } from '../mappers/shift.mapper';
import { ShiftRepositoryPort } from './shift.repository.port';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { None, Option, Some } from 'oxide.ts';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { Paginated } from '@src/libs/ddd';
import { ShiftStatusEnum } from '../domain/shift.type';

function formatToHHMMInVietnamTimezone(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // dùng định dạng 24h
    timeZone: 'Asia/Ho_Chi_Minh', // ép timezone về GMT+7
  });
}

@Injectable()
export class PrismaShiftRepository
  extends PrismaMultiTenantRepositoryBase<ShiftEntity, ShiftModel>
  implements ShiftRepositoryPort
{
  protected modelName = 'shift';

  constructor(
    manager: PrismaClientManager,
    public mapper: ShiftMapper,
  ) {
    super(manager, mapper);
  }

  async findShiftByParams(
    params: PrismaQueryBase<Prisma.ShiftWhereInput>,
  ): Promise<Option<ShiftEntity>> {
    const client = await this._getClient();
    const { where = {}, orderBy } = params;
    const result = await client.shift.findFirst({
      where: { ...where },
      orderBy,
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  async findShiftDropDown(): Promise<DropDownResult[]> {
    const client = await this._getClient();
    const result = await client.shift.findMany({
      select: {
        code: true,
        name: true,
        startTime: true,
        endTime: true,
      },
      orderBy: { code: 'asc' },
      where: {
        status: { equals: 'ACTIVE' },
      },
    });
    return result.map((item) => ({
      label: `${item.name} - ${formatToHHMMInVietnamTimezone(item.startTime)} - ${formatToHHMMInVietnamTimezone(item.endTime)}`,
      value: item.code ?? '',
    }));
  }

  async findAllShift(
    params: PrismaPaginatedQueryBase<Prisma.ShiftWhereInput>,
    status?: string,
  ): Promise<Paginated<ShiftEntity>> {
    const client = await this._getClient();

    const { limit, offset, page, where = {}, orderBy } = params;

    //filter theo status
    const statusFilter: Prisma.ShiftWhereInput = {};
    if (status) {
      switch (status) {
        case ShiftStatusEnum.ACTIVE:
          statusFilter.status = { equals: 'ACTIVE' };
          break;

        case ShiftStatusEnum.NOTACTIVE:
          statusFilter.status = { equals: 'NOTACTIVE' };
          break;
      }
    }

    // Gộp Điều kiện
    const whereFilter: Prisma.ShiftWhereInput = {
      ...where,
      ...statusFilter,
    };

    const [data, count] = await Promise.all([
      client.shift.findMany({
        skip: offset,
        take: limit,
        where: whereFilter,
        orderBy,
      }),

      client.shift.count({
        where: whereFilter,
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
