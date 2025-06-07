import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { Ok, Result } from 'oxide.ts';
import { BS_USER_REPOSITORY } from '../../bs-user.di-tokens';
import { BsUserRepositoryPort } from '../../database/bs-user.repository.port';

export class FindUserWithActiveContractQuery extends PrismaPaginatedQueryBase<Prisma.UserWhereInput> {}

export type FindUserWithActiveContractQueryResult = Result<
  Paginated<UserEntity>,
  void
>;

@QueryHandler(FindUserWithActiveContractQuery)
export class FindUserWithActiveContractQueryHandler {
  constructor(
    @Inject(BS_USER_REPOSITORY)
    protected readonly bsUserRepo: BsUserRepositoryPort,
  ) {}

  async execute(
    query: FindUserWithActiveContractQuery,
  ): Promise<FindUserWithActiveContractQueryResult> {
    const result = await this.bsUserRepo.findUserWithActiveContract(query);

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
