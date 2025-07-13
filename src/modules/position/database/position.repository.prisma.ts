import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Position as PositionModel, Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { None, Option, Some } from 'oxide.ts';
import { PositionEntity } from '../domain/position.entity';
import { PositionMapper } from '../mappers/position.mapper';
import { PositionRepositoryPort } from './position.repository.port';

@Injectable()
export class PrismaPositionRepository
  extends PrismaMultiTenantRepositoryBase<PositionEntity, PositionModel>
  implements PositionRepositoryPort
{
  protected modelName = 'position';

  constructor(
    private manager: PrismaClientManager,
    mapper: PositionMapper,
  ) {
    super(manager, mapper);
  }

  async findPositionByParams(
    params: PrismaQueryBase<Prisma.PositionWhereInput>,
  ): Promise<Option<PositionEntity>> {
    const client = await this._getClient();
    const { where = {}, orderBy } = params;
    const result = await client.position.findFirst({
      where: { ...where },
      orderBy,
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  async findPositionDropDown(roleCode: string): Promise<DropDownResult[]> {
    const client = await this._getClient();
    const result = await client.position.findMany({
      where: {
        role: roleCode,
      },
      select: {
        code: true,
        positionName: true,
      },
      orderBy: { code: 'asc' },
    });
    return result.map((item) => ({
      label: item.positionName ?? '',
      value: item.code ?? '',
    }));
  }

  async findPositionByUsercode(
    params: PrismaPaginatedQueryBase<Prisma.PositionWhereInput>,
    userCode?: string,
  ): Promise<Paginated<PositionEntity>> {
    const client = await this._getClient();
    const { limit, offset, page, where = {}, orderBy } = params;

    let finalWhere: Prisma.PositionWhereInput = { ...where };

    if (userCode) {
      const user = await client.user.findUnique({
        where: { code: userCode },
        select: { roleCode: true },
      });
      if (user?.roleCode) {
        finalWhere.role = user.roleCode;
      } else {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }
    }

    const [data, count] = await Promise.all([
      client.position.findMany({
        skip: offset,
        take: limit,
        where: finalWhere,
        include: {
          rolePosition: true,
        },
        orderBy,
      }),

      client.position.count({
        where: finalWhere,
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
