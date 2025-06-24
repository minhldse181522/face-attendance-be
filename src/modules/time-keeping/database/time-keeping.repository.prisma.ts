import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Prisma, TimeKeeping as TimeKeepingModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { TimeKeepingEntity } from '../domain/time-keeping.entity';
import { TimeKeepingRepositoryPort } from './time-keeping.repository.port';
import { TimeKeepingMapper } from '../mappers/time-keeping.mapper';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Paginated } from '@src/libs/ddd';

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

  async findLichChamCongByParam(
    params: PrismaPaginatedQueryBase<Prisma.TimeKeepingWhereInput>,
    userCode: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<Paginated<TimeKeepingEntity>> {
    const client = await this._getClient();

    const { limit, offset, page } = params;

    const [data, count] = await Promise.all([
      client.timeKeeping.findMany({
        skip: offset,
        take: limit,
        where: {
          AND: [
            { date: { gte: fromDate } },
            {
              date: { lte: toDate },
            },
          ],
          userCode,
        },
      }),

      client.workingSchedule.count({
        where: {
          AND: [
            { date: { gte: fromDate } },
            {
              date: { lte: toDate },
            },
          ],
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
