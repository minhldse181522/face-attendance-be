import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleRepositoryPort } from '../../database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '../../domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '../../working-schedule.di-tokens';

export class FindWorkingScheduleByParamsQuery extends PrismaQueryBase<Prisma.WorkingScheduleWhereInput> {}

export type FindWorkingScheduleByParamsQueryResult = Result<
  WorkingScheduleEntity,
  WorkingScheduleNotFoundError
>;

@QueryHandler(FindWorkingScheduleByParamsQuery)
export class FindWorkingScheduleByParamsQueryHandler {
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly WorkingScheduleRepo: WorkingScheduleRepositoryPort,
  ) {}

  async execute(
    query: FindWorkingScheduleByParamsQuery,
  ): Promise<FindWorkingScheduleByParamsQueryResult> {
    const found =
      await this.WorkingScheduleRepo.findWorkingScheduleByParams(query);
    if (found.isNone()) {
      return Err(new WorkingScheduleNotFoundError());
    }
    const workingSchedule = found.unwrap();
    return Ok(workingSchedule);
  }
}
