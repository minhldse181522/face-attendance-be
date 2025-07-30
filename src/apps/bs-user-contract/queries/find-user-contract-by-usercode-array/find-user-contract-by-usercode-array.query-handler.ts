import { ConflictException, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { UserContractEntity } from '../../domain/user-contract.entity';
import { UserContractNotFoundError } from '../../domain/user-contract.error';
import { BS_USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';

export class FindUserContractsByUserCodeArrayQuery {
  constructor(public readonly userCode: string) {}
}

export type FindUserContractsByUserCodeArrayResult = Result<
  UserContractEntity[],
  UserContractNotFoundError
>;

@QueryHandler(FindUserContractsByUserCodeArrayQuery)
export class FindUserContractsByUserCodeArrayQueryHandler
  implements IQueryHandler<FindUserContractsByUserCodeArrayQuery>
{
  constructor(
    @Inject(BS_USER_CONTRACT_REPOSITORY)
    protected readonly userContractRepo: UserContractRepositoryPort,
  ) {}

  async execute(
    query: FindUserContractsByUserCodeArrayQuery,
  ): Promise<FindUserContractsByUserCodeArrayResult> {
    try {
      const result = await this.userContractRepo.findByUserCodeArray(
        query.userCode,
      );
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
