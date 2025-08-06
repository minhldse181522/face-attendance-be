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
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';

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

    const { limit, offset, page, where = {} } = params;
    const user = RequestContextService.getRequestUser();
    const role = user?.roleCode;
    const currentUserCode = user?.code;
    const currentUsername = user?.userName;

    let finalWhere: Prisma.WorkingScheduleWhereInput = { ...where, userCode };

    if (role === 'R1') {
      // Admin - không lọc
    } else if (role === 'R2') {
      // Nếu là HR, lọc danh sách user được quản lý
      const contracts = await client.userContract.findMany({
        where: {
          managedBy: currentUsername,
          status: 'ACTIVE',
        },
        select: {
          userCode: true,
        },
      });

      const managedUserCodes = contracts
        .map((c) => c.userCode)
        .filter((code): code is string => code !== null);
      console.log(managedUserCodes);

      if (managedUserCodes.length === 0) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      finalWhere.userCode = {
        in: managedUserCodes,
      };
    } else if (role === 'R3') {
      // Lấy danh sách user theo chi nhánh của manager
      const currentUser = await client.user.findUnique({
        where: { code: currentUserCode },
        select: { addressCode: true },
      });

      if (!currentUser?.addressCode) {
        throw new Error('Không tìm thấy địa chỉ chi nhánh của người dùng');
      }

      const usersInSameBranch = await client.user.findMany({
        where: {
          addressCode: currentUser.addressCode,
        },
        select: {
          code: true,
        },
      });

      const userCodes = usersInSameBranch.map((u) => u.code);

      finalWhere.userCode = {
        in: userCodes,
      };
    } else if (role === 'R4') {
      // Staff chỉ xem được của chính mình
      finalWhere.userCode = currentUserCode;
    }

    const [data, count] = await Promise.all([
      client.workingSchedule.findMany({
        skip: offset,
        take: limit,
        where: {
          ...finalWhere,
          AND: [
            { date: { gte: fromDate } },
            {
              date: { lte: toDate },
            },
          ],
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
        orderBy: [{ date: 'asc' }],
      }),

      client.workingSchedule.count({
        where: {
          ...finalWhere,
          AND: [
            { date: { gte: fromDate } },
            {
              date: { lte: toDate },
            },
          ],
        },
      }),
    ]);

    // Sắp xếp theo thời gian trong ngày (chỉ lấy giờ:phút)
    const sortedData = data.sort((a, b) => {
      // So sánh ngày trước
      const dateA = new Date(a.date!).getTime();
      const dateB = new Date(b.date!).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // Nếu cùng ngày, so sánh theo giờ:phút của startTime
      if (a.shift?.startTime && b.shift?.startTime) {
        const timeA = new Date(a.shift.startTime);
        const timeB = new Date(b.shift.startTime);

        // Chỉ so sánh giờ và phút
        const hoursMinutesA = timeA.getHours() * 60 + timeA.getMinutes();
        const hoursMinutesB = timeB.getHours() * 60 + timeB.getMinutes();

        return hoursMinutesA - hoursMinutesB;
      }

      return 0;
    });

    return new Paginated({
      data: sortedData.map(this.mapper.toDomain),
      count,
      limit,
      page,
    });
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

  async findWorkingSchedulesByUserAndDateRange(
    userCode: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();

    console.log('>>> Repository search range:', {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      startOfDay: startOfDay(fromDate).toISOString(),
      endOfDay: endOfDay(toDate).toISOString(),
    });

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

  async findWorkingSchedulesByUserAndDateRangeWithShift(
    userCode: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();

    console.log('>>> Repository search range (with shift):', {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      startOfDay: startOfDay(fromDate).toISOString(),
      endOfDay: endOfDay(toDate).toISOString(),
    });

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
    startDate?: Date,
    endDate?: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();
    const where: any = {
      userCode,
      status,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const result = await client.workingSchedule.findMany({
      where,
    });

    return result.map((record) => this.mapper.toDomain(record));
  }

  async findWorkingScheduleArrayStatusByParams(
    userCode: string,
    status: string[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();
    const where: any = {
      userCode,
      status,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const result = await client.workingSchedule.findMany({
      where: {
        status: { in: status },
      },
    });

    return result.map((record) => this.mapper.toDomain(record));
  }

  async findWorkingScheduleArrayStopByParams(
    userCode: string,
    status: string[],
    dateFrom: Date,
  ): Promise<WorkingScheduleEntity[]> {
    const client = await this._getClient();
    const result = await client.workingSchedule.findMany({
      where: {
        userCode,
        status: { in: status },
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
