import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Shift as ShiftModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { ShiftEntity } from '../domain/shift.entity';
import { ShiftMapper } from '../mappers/shift.mapper';
import { ShiftRepositoryPort } from './shift.repository.port';

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
}
