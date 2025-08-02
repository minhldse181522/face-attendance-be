import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { UserBranchRepositoryPort } from '../../database/user-branch.repository.port';
import { UserBranchEntity } from '../../domain/user-branch.entity';
import { UserBranchNotFoundError } from '../../domain/user-branch.error';
import { USER_BRANCH_REPOSITORY } from '../../user-branch.di-tokens';

export class FindUserBranchByParamsQuery extends PrismaQueryBase<Prisma.UserBranchWhereInput> {}

export type FindUserBranchByParamsQueryResult = Result<
  UserBranchEntity,
  UserBranchNotFoundError
>;

@QueryHandler(FindUserBranchByParamsQuery)
export class FindUserBranchByParamsQueryHandler {
  constructor(
    @Inject(USER_BRANCH_REPOSITORY)
    protected readonly userBranchRepo: UserBranchRepositoryPort,
  ) {}

  async execute(
    query: FindUserBranchByParamsQuery,
  ): Promise<FindUserBranchByParamsQueryResult> {
    const found = await this.userBranchRepo.findUserBranchByParams(query);
    if (found.isNone()) {
      return Err(new UserBranchNotFoundError());
    }
    const userBranch = found.unwrap();
    return Ok(userBranch);
  }
}
