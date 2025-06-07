import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { WorkingScheduleRepositoryPort } from '../../database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import { WORKING_SCHEDULE_REPOSITORY } from '../../working-schedule.di-tokens';

export class FindWorkingScheduleQuery extends PrismaPaginatedQueryBase<Prisma.WorkingScheduleWhereInput> {}

export type FindWorkingScheduleQueryResult = Result<
  Paginated<WorkingScheduleEntity>,
  void
>;

@QueryHandler(FindWorkingScheduleQuery)
export class FindWorkingScheduleQueryHandler {
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
  ) {}

  async execute(
    query: FindWorkingScheduleQuery,
  ): Promise<FindWorkingScheduleQueryResult> {
    const result = await this.workingScheduleRepo.findAllPaginated(query);

    return Ok(
      new Paginated({
        data: result.data,
        count: result.count,
        limit: query.limit,
        page: query.page,
      }),
    );
  }
}
