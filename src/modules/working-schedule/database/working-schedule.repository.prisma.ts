import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  WorkingSchedule as WorkingScheduleModel,
} from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { WorkingScheduleEntity } from '../domain/working-schedule.entity';
import { WorkingScheduleMapper } from '../mappers/working-schedule.mapper';
import { WorkingScheduleRepositoryPort } from './working-schedule.repository.port';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { None, Option, Some } from 'oxide.ts';

@Injectable()
export class PrismaWorkingScheduleRepository
  extends PrismaMultiTenantRepositoryBase<
    WorkingScheduleEntity,
    WorkingScheduleModel
  >
  implements WorkingScheduleRepositoryPort
{
  protected modelName = 'workingSchedule';

  constructor(
    manager: PrismaClientManager,
    public mapper: WorkingScheduleMapper,
  ) {
    super(manager, mapper);
  }

  async findWorkingScheduleByParams(
    params: PrismaQueryBase<Prisma.WorkingScheduleWhereInput>,
  ): Promise<Option<WorkingScheduleEntity>> {
    const client = await this._getClient();
    const { where = {}, orderBy } = params;
    const result = await client.workingSchedule.findFirst({
      where: { ...where },
      orderBy,
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }
}
