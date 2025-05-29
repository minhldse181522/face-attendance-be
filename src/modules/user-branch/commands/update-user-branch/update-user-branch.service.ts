import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { USER_BRANCH_REPOSITORY } from '../../user-branch.di-tokens';
import { UserBranchRepositoryPort } from '../../database/user-branch.repository.port';
import { UserBranchEntity } from '../../domain/user-branch.entity';
import {
  UserBranchAlreadyExistsError,
  UserBranchAlreadyInUseError,
  UserBranchNotFoundError,
} from '../../domain/user-branch.error';
import { UpdateUserBranchCommand } from './update-user-branch.command';

export type UpdateUserBranchServiceResult = Result<
  UserBranchEntity,
  | UserBranchNotFoundError
  | UserBranchAlreadyExistsError
  | UserBranchAlreadyInUseError
>;

@CommandHandler(UpdateUserBranchCommand)
export class UpdateUserBranchService
  implements ICommandHandler<UpdateUserBranchCommand>
{
  constructor(
    @Inject(USER_BRANCH_REPOSITORY)
    private readonly userBranchRepo: UserBranchRepositoryPort,
  ) {}

  async execute(
    command: UpdateUserBranchCommand,
  ): Promise<UpdateUserBranchServiceResult> {
    const found = await this.userBranchRepo.findOneById(command.userBranchId);
    if (found.isNone()) {
      return Err(new UserBranchNotFoundError());
    }

    const userBranch = found.unwrap();
    const updatedResult = userBranch.update({
      ...command.getExtendedProps<UpdateUserBranchCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedUserBranch = await this.userBranchRepo.update(userBranch);
      return Ok(updatedUserBranch);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new UserBranchAlreadyExistsError());
      }
      throw error;
    }
  }
}
