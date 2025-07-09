import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { TimeKeepingRepositoryPort } from '../../database/time-keeping.repository.port';
import { TimeKeepingEntity } from '../../domain/time-keeping.entity';
import { TimeKeepingNotFoundError } from '../../domain/time-keeping.error';
import { TIME_KEEPING_REPOSITORY } from '../../time-keeping.di-tokens';

export class FindTimeKeepingByParamsQuery extends PrismaQueryBase<Prisma.TimeKeepingWhereInput> {}

export type FindTimeKeepingByParamsQueryResult = Result<
  TimeKeepingEntity,
  TimeKeepingNotFoundError
>;

@QueryHandler(FindTimeKeepingByParamsQuery)
export class FindTimeKeepingByParamsQueryHandler {
  constructor(
    @Inject(TIME_KEEPING_REPOSITORY)
    protected readonly timeKeepingRepo: TimeKeepingRepositoryPort,
  ) {}

  async execute(
    query: FindTimeKeepingByParamsQuery,
  ): Promise<FindTimeKeepingByParamsQueryResult> {
    const found = await this.timeKeepingRepo.findTimeKeepingByParams(query);
    if (found.isNone()) {
      return Err(new TimeKeepingNotFoundError());
    }
    const timeKeeping = found.unwrap();
    return Ok(timeKeeping);
  }
}
