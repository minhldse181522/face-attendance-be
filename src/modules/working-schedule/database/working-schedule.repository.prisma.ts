import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  WorkingSchedule as WorkingScheduleModel,
} from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { WorkingScheduleEntity } from '../domain/working-schedule.entity';
import { WorkingScheduleMapper } from '../mappers/working-schedule.mapper';
import {
  FindAllWorkingScheduleWithShiftParams,
  WorkingScheduleRepositoryPort,
} from './working-schedule.repository.port';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { None, Option, Some } from 'oxide.ts';
import { Paginated } from '@src/libs/ddd';
import { endOfDay, startOfDay } from 'date-fns';
import { equals } from 'class-validator';

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
          gte: startOfDay(fromDate), // 00:00:00
          lte: endOfDay(toDate), // 23:59:59.999
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

  async existsByCode(code: string): Promise<boolean> {
    const client = await this._getClient();
    const result = await client.workingSchedule.findUnique({
      where: { code },
      select: { id: true },
    });

    return !!result;
  }

  async findManyPendingToday(): Promise<
    {
      id: bigint;
      date: Date;
      shiftCode: string | null;
      shift: {
        startTime: Date | null;
      } | null;
    }[]
  > {
    const client = await this._getClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const result = await client.workingSchedule.findMany({
      where: {
        status: { equals: 'NOTSTARTED' },
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        date: true,
        shiftCode: true,
        shift: {
          select: { startTime: true },
        },
      },
    });

    return result
      .filter((item) => item.date !== null)
      .map((item) => ({
        id: item.id,
        date: item.date as Date,
        shiftCode: item.shiftCode,
        shift: item.shift,
      }));
  }

  async getAllUserCodes(): Promise<string[]> {
    const client = await this._getClient();

    const result = await client.workingSchedule.findMany({
      select: {
        userCode: true,
      },
      distinct: ['userCode'],
    });

    return result
      .map((user) => user.userCode)
      .filter((userCode): userCode is string => userCode !== null);
  }

  async findAllWorkingScheduleWithShift(
    params: FindAllWorkingScheduleWithShiftParams,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();
    const result = await client.workingSchedule.findMany({
      where: {
        userCode: params.userCode,
        date: params.date,
        status: params.status,
      },
      include: {
        shift: true,
      },
    });

    return result.map((record) => this.mapper.toDomain(record));
  }

  async findWorkingSchedulesByUserAndDateRangeWithShift(
    userCode: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();

    const result = await client.workingSchedule.findMany({
      where: {
        userCode,
        date: {
          gte: startOfDay(fromDate), // 00:00:00
          lte: endOfDay(toDate), // 23:59:59.999
        },
      },
      include: {
        shift: true,
      },
    });
    return result.map((record) => this.mapper.toDomain(record));
  }

  async findWorkingScheduleArrayByParams(
    userCode: string,
    status: string,
    date?: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();
    const result = await client.workingSchedule.findMany({
      where: {
        userCode,
        status,
        date,
      },
    });

    return result.map((record) => this.mapper.toDomain(record));
  }

  async findWorkingScheduleArrayStopByParams(
    userCode: string,
    status: string,
    dateFrom: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();
    const result = await client.workingSchedule.findMany({
      where: {
        userCode,
        status,
        ...(dateFrom && {
          date: {
            gt: dateFrom,
          },
        }),
      },
    });

    return result.map((record) => this.mapper.toDomain(record));
  }
}
