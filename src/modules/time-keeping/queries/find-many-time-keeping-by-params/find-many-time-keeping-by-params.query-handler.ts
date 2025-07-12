import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { TimeKeepingRepositoryPort } from '../../database/time-keeping.repository.port';
import { TimeKeepingEntity } from '../../domain/time-keeping.entity';
import { TimeKeepingNotFoundError } from '../../domain/time-keeping.error';
import { TIME_KEEPING_REPOSITORY } from '../../time-keeping.di-tokens';

export class FindManyTimeKeepingByParamsQuery extends PrismaQueryBase<Prisma.TimeKeepingWhereInput> {}

export type FindManyTimeKeepingByParamsQueryResult = Result<
  TimeKeepingEntity[],
  TimeKeepingNotFoundError
>;

@QueryHandler(FindManyTimeKeepingByParamsQuery)
export class FindManyTimeKeepingByParamsQueryHandler {
  constructor(
    @Inject(TIME_KEEPING_REPOSITORY)
    protected readonly timeKeepingRepo: TimeKeepingRepositoryPort,
  ) {}

  async execute(
    query: FindManyTimeKeepingByParamsQuery,
  ): Promise<FindManyTimeKeepingByParamsQueryResult> {
    const found = await this.timeKeepingRepo.findManyTimeKeepingByParams(query);
    if (!found.length) {
      return Err(new TimeKeepingNotFoundError());
    }
    return Ok(found);
  }
}
