import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { UserBranchRepositoryPort } from '../../database/user-branch.repository.port';
import { UserBranchEntity } from '../../domain/user-branch.entity';
import { UserBranchNotFoundError } from '../../domain/user-branch.error';
import { USER_BRANCH_REPOSITORY } from '../../user-branch.di-tokens';

export class FindUserBranchArrayByParamsQuery extends PrismaQueryBase<Prisma.UserBranchWhereInput> {}

export type FindUserBranchArrayByParamsQueryResult = Result<
  UserBranchEntity[],
  UserBranchNotFoundError
>;

@QueryHandler(FindUserBranchArrayByParamsQuery)
export class FindUserBranchArrayByParamsQueryHandler {
  constructor(
    @Inject(USER_BRANCH_REPOSITORY)
    protected readonly userBranchRepo: UserBranchRepositoryPort,
  ) {}

  async execute(
    query: FindUserBranchArrayByParamsQuery,
  ): Promise<FindUserBranchArrayByParamsQueryResult> {
    const found = await this.userBranchRepo.findUserBranchArrayByParams(query);
    return Ok(found);
  }
}
