import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { UserContractEntity } from '../../domain/user-contract.entity';
import { UserContractNotFoundError } from '../../domain/user-contract.error';
import { USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';

export class FindUserContractByIdQuery {
  constructor(public readonly id: bigint) {}
}

export type FindUserContractByIdResult = Result<
  UserContractEntity,
  UserContractNotFoundError
>;

@QueryHandler(FindUserContractByIdQuery)
export class FindUserContractByIdQueryHandler
  implements IQueryHandler<FindUserContractByIdQuery>
{
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    private readonly userContractRepo: UserContractRepositoryPort,
  ) {}

  async execute(
    query: FindUserContractByIdQuery,
  ): Promise<FindUserContractByIdResult> {
    const found = await this.userContractRepo.findOneById(query.id);

    if (found.isNone()) {
      return Err(new UserContractNotFoundError());
    }

    return Ok(found.unwrap());
  }
}
