import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Position as PositionModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
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
}
