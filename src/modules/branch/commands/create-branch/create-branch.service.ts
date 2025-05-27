import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { BRANCH_REPOSITORY } from '../../branch.di-tokens';
import { BranchRepositoryPort } from '../../database/branch.repository.port';
import { BranchEntity } from '../../domain/branch.entity';
import { BranchAlreadyExistsError } from '../../domain/branch.error';
import { CreateBranchCommand } from './create-branch.command';
import { GenerateCode } from '@src/libs/utils/generate-code.util';

export type CreateBranchServiceResult = Result<
  BranchEntity,
  BranchAlreadyExistsError
>;

@CommandHandler(CreateBranchCommand)
export class CreateBranchService
  implements ICommandHandler<CreateBranchCommand>
{
  constructor(
    @Inject(BRANCH_REPOSITORY)
    protected readonly branchRepo: BranchRepositoryPort,
    protected readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreateBranchCommand,
  ): Promise<CreateBranchServiceResult> {
    const code = await this.generateCode.generateCode('BRANCH', 4);
    const Branch = BranchEntity.create({
      code: code,
      ...command.getExtendedProps<CreateBranchCommand>(),
    });

    try {
      const createdBranch = await this.branchRepo.insert(Branch);
      return Ok(createdBranch);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new BranchAlreadyExistsError());
      }

      throw error;
    }
  }
}
