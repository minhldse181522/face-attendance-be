import { Paginated, RepositoryPort } from '@libs/ddd';
import { WorkingScheduleEntity } from '../domain/working-schedule.entity';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { Prisma } from '@prisma/client';
import { Option } from 'oxide.ts';

export interface WorkingScheduleRepositoryPort
  extends RepositoryPort<WorkingScheduleEntity> {
  findWorkingScheduleByParams(
    params: PrismaQueryBase<Prisma.WorkingScheduleWhereInput>,
  ): Promise<Option<WorkingScheduleEntity>>;
  findLichLamViecByParam(
    params: PrismaPaginatedQueryBase<Prisma.WorkingScheduleWhereInput>,
    fromDate: Date,
    toDate: Date,
    userCode?: string,
  ): Promise<Paginated<WorkingScheduleEntity>>;
  findWorkingSchedulesByUserAndDateRange(
    userCode: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<WorkingScheduleEntity[]>;
}
