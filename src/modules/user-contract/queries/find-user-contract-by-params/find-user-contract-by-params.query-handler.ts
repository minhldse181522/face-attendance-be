import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { UserContractEntity } from '../../domain/user-contract.entity';
import { UserContractNotFoundError } from '../../domain/user-contract.error';
import { USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';

export class FindUserContractByParamsQuery extends PrismaQueryBase<Prisma.UserContractWhereInput> {}

export type FindUserContractByParamsQueryResult = Result<
  UserContractEntity,
  UserContractNotFoundError
>;

@QueryHandler(FindUserContractByParamsQuery)
export class FindUserContractByParamsQueryHandler {
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    protected readonly userContractRepo: UserContractRepositoryPort,
  ) {}

  async execute(
    query: FindUserContractByParamsQuery,
  ): Promise<FindUserContractByParamsQueryResult> {
    const found = await this.userContractRepo.findUserContractByParams(query);
    if (found.isNone()) {
      return Err(new UserContractNotFoundError());
    }
    const userContract = found.unwrap();
    return Ok(userContract);
  }
}
