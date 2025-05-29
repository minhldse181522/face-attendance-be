import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { USER_BRANCH_REPOSITORY } from '../../user-branch.di-tokens';
import { UserBranchRepositoryPort } from '../../database/user-branch.repository.port';
import { UserBranchEntity } from '../../domain/user-branch.entity';
import { UserBranchAlreadyExistsError } from '../../domain/user-branch.error';
import { CreateUserBranchCommand } from './create-user-branch.command';
import { GenerateCode } from '@src/libs/utils/generate-code.util';

export type CreateUserBranchServiceResult = Result<
  UserBranchEntity,
  UserBranchAlreadyExistsError
>;

@CommandHandler(CreateUserBranchCommand)
export class CreateUserBranchService
  implements ICommandHandler<CreateUserBranchCommand>
{
  constructor(
    @Inject(USER_BRANCH_REPOSITORY)
    protected readonly userBranchRepo: UserBranchRepositoryPort,
    protected readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreateUserBranchCommand,
  ): Promise<CreateUserBranchServiceResult> {
    const code = await this.generateCode.generateCode('UB', 4);
    const userBranch = UserBranchEntity.create({
      code: code,
      ...command.getExtendedProps<CreateUserBranchCommand>(),
    });

    try {
      const createdUserBranch = await this.userBranchRepo.insert(userBranch);
      return Ok(createdUserBranch);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new UserBranchAlreadyExistsError());
      }

      throw error;
    }
  }
}
