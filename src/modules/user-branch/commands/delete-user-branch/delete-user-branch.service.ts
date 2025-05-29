import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { USER_BRANCH_REPOSITORY } from '../../user-branch.di-tokens';
import { UserBranchRepositoryPort } from '../../database/user-branch.repository.port';
import { UserBranchEntity } from '../../domain/user-branch.entity';
import { UserBranchNotFoundError } from '../../domain/user-branch.error';
import { DeleteUserBranchCommand } from './delete-user-branch.command';

export type DeleteUserBranchServiceResult = Result<
  boolean,
  UserBranchNotFoundError
>;

@CommandHandler(DeleteUserBranchCommand)
export class DeleteUserBranchService
  implements ICommandHandler<DeleteUserBranchCommand>
{
  constructor(
    @Inject(USER_BRANCH_REPOSITORY)
    protected readonly userBranchRepo: UserBranchRepositoryPort,
  ) {}

  async execute(
    command: DeleteUserBranchCommand,
  ): Promise<DeleteUserBranchServiceResult> {
    try {
      const result = await this.userBranchRepo.delete({
        id: command.userBranchId,
      } as UserBranchEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new UserBranchNotFoundError(error));
      }

      throw error;
    }
  }
}
