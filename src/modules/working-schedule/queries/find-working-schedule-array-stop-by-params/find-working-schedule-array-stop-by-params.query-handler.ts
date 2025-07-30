import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleRepositoryPort } from '../../database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '../../domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '../../working-schedule.di-tokens';

export class FindWorkingScheduleArrayStopByParamsQuery extends PrismaQueryBase<Prisma.WorkingScheduleWhereInput> {
  userCode: string;
  status: string;
  fromDate: Date;
  constructor(params: { userCode: string; status: string; fromDate: Date }) {
    super();
    this.userCode = params.userCode;
    this.status = params.status;
    this.fromDate = params.fromDate;
  }
}

export type FindWorkingScheduleArrayStopByParamsQueryResult = Result<
  WorkingScheduleEntity[],
  WorkingScheduleNotFoundError
>;

@QueryHandler(FindWorkingScheduleArrayStopByParamsQuery)
export class FindWorkingScheduleArrayStopByParamsQueryHandler {
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly WorkingScheduleRepo: WorkingScheduleRepositoryPort,
  ) {}

  async execute(
    query: FindWorkingScheduleArrayStopByParamsQuery,
  ): Promise<FindWorkingScheduleArrayStopByParamsQueryResult> {
    const found =
      await this.WorkingScheduleRepo.findWorkingScheduleArrayStopByParams(
        query.userCode,
        query.status,
        query.fromDate,
      );
    if (found.length === 0) {
      return Err(new WorkingScheduleNotFoundError());
    }
    return Ok(found);
  }
}
