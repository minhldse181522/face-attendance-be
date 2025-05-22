import { USER_REPOSITORY } from '@modules/user/user.di-tokens';
import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { RegisterCommand } from './register.command';
import { UserRepositoryPort } from '@src/modules/user/database/user.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { RegisterError } from '../../domain/auth.error';

export type RegisterServiceResult = Result<UserEntity, any>;

@CommandHandler(RegisterCommand)
export class RegisterService implements ICommandHandler<RegisterCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterServiceResult> {
    const existing = await this.userRepo.findByUsername(command.userName);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(command.password, 10);
    const props = command.getExtendedProps<RegisterCommand>();
    const newUser = UserEntity.create({
      ...props,
      password: hashedPassword,
      isActive: true,
    });

    try {
      const createdUser = await this.userRepo.insert(newUser);
      return Ok(createdUser);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new RegisterError(error));
      }
      throw error;
    }
  }
}
