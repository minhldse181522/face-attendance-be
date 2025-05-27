import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { BRANCH_REPOSITORY } from '../../branch.di-tokens';
import { BranchRepositoryPort } from '../../database/branch.repository.port';
import { BranchEntity } from '../../domain/branch.entity';
import {
  BranchAlreadyExistsError,
  BranchAlreadyInUseError,
  BranchNotFoundError,
} from '../../domain/branch.error';
import { UpdateBranchCommand } from './update-branch.command';

export type UpdateBranchServiceResult = Result<
  BranchEntity,
  BranchNotFoundError | BranchAlreadyExistsError | BranchAlreadyInUseError
>;

@CommandHandler(UpdateBranchCommand)
export class UpdateBranchService
  implements ICommandHandler<UpdateBranchCommand>
{
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepositoryPort,
  ) {}

  async execute(
    command: UpdateBranchCommand,
  ): Promise<UpdateBranchServiceResult> {
    const found = await this.branchRepo.findOneById(command.branchId);
    if (found.isNone()) {
      return Err(new BranchNotFoundError());
    }

    const branch = found.unwrap();
    const updatedResult = branch.update({
      ...command.getExtendedProps<UpdateBranchCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedBranch = await this.branchRepo.update(branch);
      return Ok(updatedBranch);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new BranchAlreadyExistsError());
      }
      throw error;
    }
  }
}
