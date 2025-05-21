import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { UserRepositoryPort } from '../../database/user.repository.port';
import { UserEntity } from '../../domain/user.entity';
import { UserNotFoundError } from '../../domain/user.error';
import { DeleteUserCommand } from './delete-user.command';
import { USER_REPOSITORY } from '../../user.di-tokens';

export type DeleteUserServiceResult = Result<boolean, UserNotFoundError>;

@CommandHandler(DeleteUserCommand)
export class DeleteUserService implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    protected readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: DeleteUserCommand): Promise<DeleteUserServiceResult> {
    try {
      const result = await this.userRepo.delete({
        id: command.userId,
      } as UserEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new UserNotFoundError(error));
      }

      throw error;
    }
  }
}
