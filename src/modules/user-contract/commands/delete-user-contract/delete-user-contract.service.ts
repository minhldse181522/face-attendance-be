import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { UserContractEntity } from '../../domain/user-contract.entity';
import { UserContractNotFoundError } from '../../domain/user-contract.error';
import { USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';
import { DeleteUserContractCommand } from './delete-user-contract.command';

export type DeleteUserContractServiceResult = Result<
  boolean,
  UserContractNotFoundError
>;

@CommandHandler(DeleteUserContractCommand)
export class DeleteUserContractService
  implements ICommandHandler<DeleteUserContractCommand>
{
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    protected readonly userContractRepo: UserContractRepositoryPort,
  ) {}

  async execute(
    command: DeleteUserContractCommand,
  ): Promise<DeleteUserContractServiceResult> {
    try {
      const result = await this.userContractRepo.delete({
        id: command.userContractId,
      } as UserContractEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new UserContractNotFoundError(error));
      }

      throw error;
    }
  }
}
