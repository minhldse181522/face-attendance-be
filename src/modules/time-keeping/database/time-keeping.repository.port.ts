import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { Option } from 'oxide.ts';
import { TimeKeepingEntity } from '../domain/time-keeping.entity';

export interface TimeKeepingRepositoryPort
  extends RepositoryPort<TimeKeepingEntity> {
  findLichChamCongByParam(
    params: PrismaPaginatedQueryBase<Prisma.TimeKeepingWhereInput>,
    userCode: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<Paginated<TimeKeepingEntity>>;
  findTimeKeepingByParams(
    params: PrismaQueryBase<Prisma.TimeKeepingWhereInput>,
  ): Promise<Option<TimeKeepingEntity>>;
  findManyTimeKeepingByParams(
    params: PrismaQueryBase<Prisma.TimeKeepingWhereInput>,
  ): Promise<TimeKeepingEntity[]>;
  findFinishWorkDate(): Promise<number>;
  findLateWorkDate(): Promise<number>;
}
