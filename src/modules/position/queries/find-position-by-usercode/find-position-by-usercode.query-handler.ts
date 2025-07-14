import { GeneratedFindOptions } from '@chax-at/prisma-filter';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { PositionRepositoryPort } from '../../database/position.repository.port';
import { PositionEntity } from '../../domain/position.entity';
import { POSITION_REPOSITORY } from '../../position.di-tokens';

export class FindPositionByUsercodeQuery extends PrismaPaginatedQueryBase<Prisma.PositionWhereInput> {
  userCode?: string;
  constructor(
    props: GeneratedFindOptions<Prisma.PositionWhereInput> & {
      userCode?: string;
    },
  ) {
    super(props);
    this.userCode = props.userCode;
  }
}

export type FindPositionByUsercodeQueryResult = Result<
  Paginated<PositionEntity>,
  void
>;

@QueryHandler(FindPositionByUsercodeQuery)
export class FindPositionByUsercodeQueryHandler {
  constructor(
    @Inject(POSITION_REPOSITORY)
    protected readonly positionRepo: PositionRepositoryPort,
  ) {}

  async execute(
    query: FindPositionByUsercodeQuery,
  ): Promise<FindPositionByUsercodeQueryResult> {
    const result = await this.positionRepo.findPositionByUsercode(
      {
        ...query,
      },
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
