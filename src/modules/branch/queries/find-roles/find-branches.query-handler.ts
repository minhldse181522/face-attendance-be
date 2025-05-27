import { Paginated } from '@libs/ddd';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryWithQuickSearchBase } from '@src/libs/ddd/prisma-query-with-quick-search.base';
import { Ok, Result } from 'oxide.ts';
import { BRANCH_REPOSITORY } from '../../branch.di-tokens';
import { BranchRepositoryPort } from '../../database/branch.repository.port';
import { BranchEntity } from '../../domain/branch.entity';
import { FindBranchsRequestDto } from './find-branches.request.dto';

export class FindBranchsQuery extends PrismaPaginatedQueryWithQuickSearchBase<Prisma.BranchWhereInput> {
  quickSearch?: string | number;
  constructor(props: FindBranchsRequestDto) {
    super(props.findOptions);
    Object.assign(this, props);
  }
}

export type FindBranchsQueryResult = Result<Paginated<BranchEntity>, void>;

@QueryHandler(FindBranchsQuery)
export class FindBranchsQueryHandler
  implements IQueryHandler<FindBranchsQuery>
{
  constructor(
    @Inject(BRANCH_REPOSITORY)
    protected readonly branchRepo: BranchRepositoryPort,
  ) {}

  async execute(query: FindBranchsQuery): Promise<FindBranchsQueryResult> {
    const result = await this.branchRepo.findPaginatedWithQuickSearch(query);

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
