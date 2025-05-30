import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';
import { UserContractEntity } from '../../domain/user-contract.entity';

export class FindUserContractQuery extends PrismaPaginatedQueryBase<Prisma.UserContractWhereInput> {}

export type FindUserContractQueryResult = Result<
  Paginated<UserContractEntity>,
  void
>;

@QueryHandler(FindUserContractQuery)
export class FindUserContractQueryHandler {
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    protected readonly userContractRepo: UserContractRepositoryPort,
  ) {}

  async execute(
    query: FindUserContractQuery,
  ): Promise<FindUserContractQueryResult> {
    const result = await this.userContractRepo.findAllPaginated(query);

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
