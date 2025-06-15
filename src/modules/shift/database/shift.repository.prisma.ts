import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Prisma, Shift as ShiftModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { ShiftEntity } from '../domain/shift.entity';
import { ShiftMapper } from '../mappers/shift.mapper';
import { ShiftRepositoryPort } from './shift.repository.port';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { None, Option, Some } from 'oxide.ts';
import { DropDownResult } from '@src/libs/utils/dropdown.util';

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
    });
    return result.map((item) => ({
      label: `${item.name} - ${item.startTime?.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${item.endTime?.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      value: item.code ?? '',
    }));
  }
}
