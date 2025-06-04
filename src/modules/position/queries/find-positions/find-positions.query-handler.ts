import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { PositionRepositoryPort } from '../../database/position.repository.port';
import { PositionEntity } from '../../domain/position.entity';
import { POSITION_REPOSITORY } from '../../position.di-tokens';

export class FindPositionQuery extends PrismaPaginatedQueryBase<Prisma.PositionWhereInput> {}

export type FindPositionQueryResult = Result<Paginated<PositionEntity>, void>;

@QueryHandler(FindPositionQuery)
export class FindPositionQueryHandler {
  constructor(
    @Inject(POSITION_REPOSITORY)
    protected readonly positionRepo: PositionRepositoryPort,
  ) {}

  async execute(query: FindPositionQuery): Promise<FindPositionQueryResult> {
    const result = await this.positionRepo.findAllPaginated(query);

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
