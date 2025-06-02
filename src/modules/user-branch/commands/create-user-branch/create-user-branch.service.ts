import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { BRANCH_REPOSITORY } from '@src/modules/branch/branch.di-tokens';
import { BranchRepositoryPort } from '@src/modules/branch/database/branch.repository.port';
import { USER_CONTRACT_REPOSITORY } from '@src/modules/user-contract/user-contract.di-tokens';
import { UserContractRepositoryPort } from '@src/modules/user-contract/database/user-contract.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { UserBranchRepositoryPort } from '../../database/user-branch.repository.port';
import { UserBranchEntity } from '../../domain/user-branch.entity';
import { UserBranchAlreadyExistsError } from '../../domain/user-branch.error';
import { USER_BRANCH_REPOSITORY } from '../../user-branch.di-tokens';
import { CreateUserBranchCommand } from './create-user-branch.command';

export type CreateUserBranchServiceResult = Result<
  UserBranchEntity,
  UserBranchAlreadyExistsError | NotFoundException
>;

@CommandHandler(CreateUserBranchCommand)
export class CreateUserBranchService
  implements ICommandHandler<CreateUserBranchCommand>
{
  constructor(
    @Inject(USER_BRANCH_REPOSITORY)
    protected readonly userBranchRepo: UserBranchRepositoryPort,
    @Inject(BRANCH_REPOSITORY)
    protected readonly branchRepo: BranchRepositoryPort,
    @Inject(USER_CONTRACT_REPOSITORY)
    protected readonly contractRepo: UserContractRepositoryPort,
    protected readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreateUserBranchCommand,
  ): Promise<CreateUserBranchServiceResult> {
    const { userContractCode, branchCode } =
      command.getExtendedProps<CreateUserBranchCommand>();

    // Validate that the user contract exists
    if (userContractCode) {
      const userContract = await this.contractRepo.checkExist(userContractCode);

      if (!userContract) {
        return Err(
          new NotFoundException(
            `User contract with code ${userContractCode} not found`,
          ),
        );
      }
    }

    // Validate that the branch exists
    const branch = await this.branchRepo.checkExist(branchCode);

    if (!branch) {
      return Err(
        new NotFoundException(`Branch with code ${branchCode} not found`),
      );
    }

    const code = await this.generateCode.generateCode('UB', 4);
    const commandProps = command.getExtendedProps<CreateUserBranchCommand>();

    // Ensure userContractCode is explicitly null when undefined
    const userBranch = UserBranchEntity.create({
      code: code,
      branchCode: commandProps.branchCode,
      userContractCode: commandProps.userContractCode || null, // Convert undefined to null
      createdBy: commandProps.createdBy,
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
