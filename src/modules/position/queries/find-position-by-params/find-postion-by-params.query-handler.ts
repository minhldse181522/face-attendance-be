import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { PositionRepositoryPort } from '../../database/position.repository.port';
import { PositionEntity } from '../../domain/position.entity';
import { PositionNotFoundError } from '../../domain/position.error';
import { POSITION_REPOSITORY } from '../../position.di-tokens';

export class FindPositionByParamsQuery extends PrismaQueryBase<Prisma.PositionWhereInput> {}

export type FindPositionByParamsQueryResult = Result<
  PositionEntity,
  PositionNotFoundError
>;

@QueryHandler(FindPositionByParamsQuery)
export class FindPositionByParamsQueryHandler {
  constructor(
    @Inject(POSITION_REPOSITORY)
    protected readonly positionRepo: PositionRepositoryPort,
  ) {}

  async execute(
    query: FindPositionByParamsQuery,
  ): Promise<FindPositionByParamsQueryResult> {
    const found = await this.positionRepo.findPositionByParams(query);
    if (found.isNone()) {
      return Err(new PositionNotFoundError());
    }
    const position = found.unwrap();
    return Ok(position);
  }
}
