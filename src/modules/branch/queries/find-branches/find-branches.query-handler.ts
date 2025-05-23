import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { BranchRepositoryPort } from '../../database/branch.repository.port';
import { BranchEntity } from '../../domain/branch.entity';
import { BRANCH_REPOSITORY } from '../../branch.di-tokens';

export class FindBranchQuery extends PrismaPaginatedQueryBase<Prisma.BranchWhereInput> {}

export type FindBranchQueryResult = Result<Paginated<BranchEntity>, void>;

@QueryHandler(FindBranchQuery)
export class FindBranchQueryHandler {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    protected readonly branchRepo: BranchRepositoryPort,
  ) {}

  async execute(query: FindBranchQuery): Promise<FindBranchQueryResult> {
    const result = await this.branchRepo.findAllPaginated(query);

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
