import { Paginated } from '@libs/ddd';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryWithQuickSearchBase } from '@src/libs/ddd/prisma-query-with-quick-search.base';
import { Ok, Result } from 'oxide.ts';
import { USER_BRANCH_REPOSITORY } from '../../user-branch.di-tokens';
import { UserBranchRepositoryPort } from '../../database/user-branch.repository.port';
import { UserBranchEntity } from '../../domain/user-branch.entity';
import { FindUserBranchesRequestDto } from './find-user-branches.request.dto';

export class FindUserBranchesQuery extends PrismaPaginatedQueryWithQuickSearchBase<Prisma.UserBranchWhereInput> {
  quickSearch?: string | number;
  constructor(props: FindUserBranchesRequestDto) {
    super(props.findOptions);
    Object.assign(this, props);
  }
}

export type FindUserBranchesQueryResult = Result<
  Paginated<UserBranchEntity>,
  void
>;

@QueryHandler(FindUserBranchesQuery)
export class FindUserBranchesQueryHandler
  implements IQueryHandler<FindUserBranchesQuery>
{
  constructor(
    @Inject(USER_BRANCH_REPOSITORY)
    protected readonly userBranchRepo: UserBranchRepositoryPort,
  ) {}

  async execute(
    query: FindUserBranchesQuery,
  ): Promise<FindUserBranchesQueryResult> {
    const result =
      await this.userBranchRepo.findPaginatedWithQuickSearch(query);

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
