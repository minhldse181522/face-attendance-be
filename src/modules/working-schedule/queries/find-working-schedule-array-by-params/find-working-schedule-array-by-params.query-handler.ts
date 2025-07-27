import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleRepositoryPort } from '../../database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '../../domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '../../working-schedule.di-tokens';

export class FindWorkingScheduleArrayByParamsQuery extends PrismaQueryBase<Prisma.WorkingScheduleWhereInput> {
  userCode: string;
  status: string;
  constructor(params: { userCode: string; status: string }) {
    super();
    this.userCode = params.userCode;
    this.status = params.status;
  }
}

export type FindWorkingScheduleArrayByParamsQueryResult = Result<
  WorkingScheduleEntity[],
  WorkingScheduleNotFoundError
>;

@QueryHandler(FindWorkingScheduleArrayByParamsQuery)
export class FindWorkingScheduleArrayByParamsQueryHandler {
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly WorkingScheduleRepo: WorkingScheduleRepositoryPort,
  ) {}

  async execute(
    query: FindWorkingScheduleArrayByParamsQuery,
  ): Promise<FindWorkingScheduleArrayByParamsQueryResult> {
    const found =
      await this.WorkingScheduleRepo.findWorkingScheduleArrayByParams(
        query.userCode,
        query.status,
      );
    if (found.length === 0) {
      return Err(new WorkingScheduleNotFoundError());
    }
    return Ok(found);
  }
}
