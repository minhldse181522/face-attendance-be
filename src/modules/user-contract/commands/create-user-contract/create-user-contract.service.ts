import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { UserContractEntity } from '../../domain/user-contract.entity';
import { UserContractAlreadyExistsError } from '../../domain/user-contract.error';
import { USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';
import { CreateUserContractCommand } from './create-user-contract.command';

export type CreateUserContractServiceResult = Result<
  UserContractEntity,
  UserContractAlreadyExistsError
>;

@CommandHandler(CreateUserContractCommand)
export class CreateUserContractService
  implements ICommandHandler<CreateUserContractCommand>
{
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    protected readonly userContractRepo: UserContractRepositoryPort,
  ) {}

  async execute(
    command: CreateUserContractCommand,
  ): Promise<CreateUserContractServiceResult> {
    const userContract = UserContractEntity.create({
      ...command.getExtendedProps<CreateUserContractCommand>(),
    });

    try {
      const createdUserContract =
        await this.userContractRepo.insert(userContract);
      return Ok(createdUserContract);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new UserContractAlreadyExistsError());
      }

      throw error;
    }
  }
}
