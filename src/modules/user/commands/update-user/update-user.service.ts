import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { UserRepositoryPort } from '../../database/user.repository.port';
import { UserEntity } from '../../domain/user.entity';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../domain/user.error';
import { USER_REPOSITORY } from '../../user.di-tokens';
import { UpdateUserCommand } from './update-user.command';

export type UpdateUserServiceResult = Result<
  UserEntity,
  UserNotFoundError | UserAlreadyExistsError
>;

@CommandHandler(UpdateUserCommand)
export class UpdateUserService implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UpdateUserServiceResult> {
    const found = await this.userRepo.findOneById(command.userId);
    if (found.isNone()) {
      return Err(new UserNotFoundError());
    }

    const user = found.unwrap();
    const updatedResult = user.update({
      ...command.getExtendedProps<UpdateUserCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedUser = await this.userRepo.update(user);
      return Ok(updatedUser);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new UserAlreadyExistsError());
      }
      throw error;
    }
  }
}
