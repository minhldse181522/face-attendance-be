import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { TimeKeepingRepositoryPort } from '../../database/time-keeping.repository.port';
import { TimeKeepingEntity } from '../../domain/time-keeping.entity';
import { TIME_KEEPING_REPOSITORY } from '../../time-keeping.di-tokens';

export class FindTimeKeepingQuery extends PrismaPaginatedQueryBase<Prisma.TimeKeepingWhereInput> {}

export type FindTimeKeepingQueryResult = Result<
  Paginated<TimeKeepingEntity>,
  void
>;

@QueryHandler(FindTimeKeepingQuery)
export class FindTimeKeepingQueryHandler {
  constructor(
    @Inject(TIME_KEEPING_REPOSITORY)
    protected readonly timeKeepingRepo: TimeKeepingRepositoryPort,
  ) {}

  async execute(
    query: FindTimeKeepingQuery,
  ): Promise<FindTimeKeepingQueryResult> {
    const result = await this.timeKeepingRepo.findAllPaginated(query);

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
