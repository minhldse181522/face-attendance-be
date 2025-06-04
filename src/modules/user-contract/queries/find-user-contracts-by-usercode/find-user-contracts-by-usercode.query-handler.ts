import { ConflictException, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { UserContractEntity } from '../../domain/user-contract.entity';
import { UserContractNotFoundError } from '../../domain/user-contract.error';
import { USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';

export class FindUserContractsByUserCodeQuery {
  constructor(public readonly userCode: string) {}
}

export type FindUserContractsByUserCodeResult = Result<
  UserContractEntity,
  UserContractNotFoundError
>;

@QueryHandler(FindUserContractsByUserCodeQuery)
export class FindUserContractsByUserCodeQueryHandler
  implements IQueryHandler<FindUserContractsByUserCodeQuery>
{
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    protected readonly userContractRepo: UserContractRepositoryPort,
  ) {}

  async execute(
    query: FindUserContractsByUserCodeQuery,
  ): Promise<FindUserContractsByUserCodeResult> {
    try {
      const result = await this.userContractRepo.findByUserCode(query.userCode);
      return Ok(result);
    } catch (error) {
      if (error instanceof UserContractNotFoundError) {
        throw new ConflictException({
          message: error.message,
          code: error.code,
        });
      }
      throw error; // Re-throw other errors
    }
  }
}
