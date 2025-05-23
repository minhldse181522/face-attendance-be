import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { BRANCH_REPOSITORY } from '../../branch.di-tokens';
import { BranchRepositoryPort } from '../../database/branch.repository.port';
import { BranchEntity } from '../../domain/branch.entity';
import { BranchNotFoundError } from '../../domain/branch.error';
import { DeleteBranchCommand } from './delete-branch.command';

export type DeleteBranchServiceResult = Result<boolean, BranchNotFoundError>;

@CommandHandler(DeleteBranchCommand)
export class DeleteBranchService
  implements ICommandHandler<DeleteBranchCommand>
{
  constructor(
    @Inject(BRANCH_REPOSITORY)
    protected readonly branchRepo: BranchRepositoryPort,
  ) {}

  async execute(
    command: DeleteBranchCommand,
  ): Promise<DeleteBranchServiceResult> {
    try {
      const result = await this.branchRepo.delete({
        id: command.branchId,
      } as BranchEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new BranchNotFoundError(error));
      }

      throw error;
    }
  }
}
