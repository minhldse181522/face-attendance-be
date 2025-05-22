import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Position as PositionModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
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
}
