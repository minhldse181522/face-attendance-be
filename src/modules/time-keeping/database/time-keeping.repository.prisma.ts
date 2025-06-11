import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { TimeKeeping as TimeKeepingModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { TimeKeepingEntity } from '../domain/time-keeping.entity';
import { TimeKeepingRepositoryPort } from './time-keeping.repository.port';
import { TimeKeepingMapper } from '../mappers/time-keeping.mapper';

@Injectable()
export class PrismaTimeKeepingRepository
  extends PrismaMultiTenantRepositoryBase<TimeKeepingEntity, TimeKeepingModel>
  implements TimeKeepingRepositoryPort
{
  protected modelName = 'timeKeeping';

  constructor(
    manager: PrismaClientManager,
    public mapper: TimeKeepingMapper,
  ) {
    super(manager, mapper);
  }
}
