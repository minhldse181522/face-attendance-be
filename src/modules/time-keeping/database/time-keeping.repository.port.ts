import { Paginated, RepositoryPort } from '@libs/ddd';
import { TimeKeepingEntity } from '../domain/time-keeping.entity';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Prisma } from '@prisma/client';

export interface TimeKeepingRepositoryPort
  extends RepositoryPort<TimeKeepingEntity> {
  findLichChamCongByParam(
    params: PrismaPaginatedQueryBase<Prisma.TimeKeepingWhereInput>,
    userCode: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<Paginated<TimeKeepingEntity>>;
}
