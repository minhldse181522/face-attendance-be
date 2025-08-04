import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleRepositoryPort } from '../../database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '../../domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '../../working-schedule.di-tokens';

export class FindWorkingScheduleArrayStatusByParamsQuery extends PrismaQueryBase<Prisma.WorkingScheduleWhereInput> {
  userCode: string;
  status: string[];
  startDate?: Date;
  endDate?: Date;
  constructor(params: {
    userCode: string;
    status: string[];
    startDate?: Date;
    endDate?: Date;
  }) {
    super();
    this.userCode = params.userCode;
    this.status = params.status;
    this.startDate = params.startDate;
    this.endDate = params.endDate;
  }
}

export type FindWorkingScheduleArrayStatusByParamsQueryResult = Result<
  WorkingScheduleEntity[],
  WorkingScheduleNotFoundError
>;

@QueryHandler(FindWorkingScheduleArrayStatusByParamsQuery)
export class FindWorkingScheduleArrayStatusByParamsQueryHandler {
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly WorkingScheduleRepo: WorkingScheduleRepositoryPort,
  ) {}

  async execute(
    query: FindWorkingScheduleArrayStatusByParamsQuery,
  ): Promise<FindWorkingScheduleArrayStatusByParamsQueryResult> {
    const found =
      await this.WorkingScheduleRepo.findWorkingScheduleArrayStatusByParams(
        query.userCode,
        query.status,
        query.startDate,
        query.endDate,
      );
    if (found.length === 0) {
      return Err(new WorkingScheduleNotFoundError());
    }
    return Ok(found);
  }
}
