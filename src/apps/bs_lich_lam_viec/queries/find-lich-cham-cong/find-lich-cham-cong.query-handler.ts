import { GeneratedFindOptions } from '@chax-at/prisma-filter';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { TimeKeepingRepositoryPort } from '@src/modules/time-keeping/database/time-keeping.repository.port';
import { TimeKeepingEntity } from '@src/modules/time-keeping/domain/time-keeping.entity';
import { TIME_KEEPING_REPOSITORY } from '@src/modules/time-keeping/time-keeping.di-tokens';
import { Ok, Result } from 'oxide.ts';

export class FindLichChamCongQuery extends PrismaPaginatedQueryBase<Prisma.TimeKeepingWhereInput> {
  fromDate?: Date;
  toDate?: Date;
  userCode: string;
  constructor(
    props: GeneratedFindOptions<Prisma.TimeKeepingWhereInput> & {
      fromDate?: Date;
      toDate?: Date;
      userCode: string;
    },
  ) {
    super(props);
    this.fromDate = props.fromDate;
    this.toDate = props.toDate;
    this.userCode = props.userCode;
  }
}

export type FindLichChamCongQueryResult = Result<
  Paginated<TimeKeepingEntity>,
  void
>;

@QueryHandler(FindLichChamCongQuery)
export class FindLichChamCongQueryHandler {
  constructor(
    @Inject(TIME_KEEPING_REPOSITORY)
    protected readonly timeKeepingRepo: TimeKeepingRepositoryPort,
  ) {}

  async execute(
    query: FindLichChamCongQuery,
  ): Promise<FindLichChamCongQueryResult> {
    const result = await this.timeKeepingRepo.findLichChamCongByParam(
      {
        ...query,
      },
      query.userCode,
      query.fromDate,
      query.toDate,
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
