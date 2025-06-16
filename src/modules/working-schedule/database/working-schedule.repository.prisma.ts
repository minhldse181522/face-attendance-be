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
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { None, Option, Some } from 'oxide.ts';
import { Paginated } from '@src/libs/ddd';

@Injectable()
export class PrismaWorkingScheduleRepository
  extends PrismaMultiTenantRepositoryBase<
    WorkingScheduleEntity,
    WorkingScheduleModel
  >
  implements WorkingScheduleRepositoryPort
{
  protected modelName = 'workingSchedule';

  constructor(manager: PrismaClientManager, mapper: WorkingScheduleMapper) {
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

  async findLichLamViecByParam(
    params: PrismaPaginatedQueryBase<Prisma.WorkingScheduleWhereInput>,
    fromDate: Date,
    toDate: Date,
    userCode?: string,
  ): Promise<Paginated<WorkingScheduleEntity>> {
    const client = await this._getClient();

    const { limit, offset, page } = params;

    const [data, count] = await Promise.all([
      client.workingSchedule.findMany({
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
        include: {
          user: true,
          shift: true,
          timeKeeping: true,
          branch: true,
          userContract: {
            include: {
              manager: true,
              position: true,
            },
          },
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

  async findWorkingSchedulesByUserAndDateRange(
    userCode: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();

    const result = await client.workingSchedule.findMany({
      where: {
        userCode,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });
    return result.map(
      (item) =>
        new WorkingScheduleEntity({
          props: {
            code: item.code!,
            userCode: item.userCode!,
            userContractCode: item.userContractCode!,
            date: item.date!,
            shiftCode: item.shiftCode!,
            status: item.status!,
            branchCode: item.branchCode!,
            createdBy: item.createdBy,
          },
          id: item.id,
        }),
    );
  }
}
