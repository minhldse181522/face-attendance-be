import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { UserContractEntity } from '../../domain/user-contract.entity';
import {
  UserContractAlreadyExistsError,
  UserContractAlreadyInUseError,
  UserContractNotFoundError,
} from '../../domain/user-contract.error';
import { USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';
import { UpdateUserContractCommand } from './update-user-contract.command';

export type UpdateUserContractServiceResult = Result<
  UserContractEntity,
  | UserContractNotFoundError
  | UserContractAlreadyExistsError
  | UserContractAlreadyInUseError
>;

@CommandHandler(UpdateUserContractCommand)
export class UpdateUserContractService
  implements ICommandHandler<UpdateUserContractCommand>
{
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    private readonly userContractRepo: UserContractRepositoryPort,
  ) {}

  async execute(
    command: UpdateUserContractCommand,
  ): Promise<UpdateUserContractServiceResult> {
    const found = await this.userContractRepo.findOneById(
      command.userContractId,
    );
    if (found.isNone()) {
      return Err(new UserContractNotFoundError());
    }

    const userContract = found.unwrap();
    const updatedResult = userContract.update({
      ...command.getExtendedProps<UpdateUserContractCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedUserContract =
        await this.userContractRepo.update(userContract);
      return Ok(updatedUserContract);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new UserContractAlreadyExistsError());
      }
      throw error;
    }
  }
}
