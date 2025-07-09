import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { GeneratedFindOptions } from '@chax-at/prisma-filter';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';

export class FindLichLamViecQuery extends PrismaPaginatedQueryBase<Prisma.WorkingScheduleWhereInput> {
  fromDate: Date;
  toDate: Date;
  userCode?: string;
  constructor(
    props: GeneratedFindOptions<Prisma.WorkingScheduleWhereInput> & {
      fromDate: Date;
      toDate: Date;
      userCode?: string;
    },
  ) {
    super(props);
    this.fromDate = props.fromDate;
    this.toDate = props.toDate;
    this.userCode = props.userCode;
  }
}

export type FindLichLamViecQueryResult = Result<
  Paginated<WorkingScheduleEntity>,
  void
>;

@QueryHandler(FindLichLamViecQuery)
export class FindLichLamViecQueryHandler {
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
  ) {}

  async execute(
    query: FindLichLamViecQuery,
  ): Promise<FindLichLamViecQueryResult> {
    const result = await this.workingScheduleRepo.findLichLamViecByParam(
      {
        ...query,
      },
      query.fromDate,
      query.toDate,
      query.userCode,
    );

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
