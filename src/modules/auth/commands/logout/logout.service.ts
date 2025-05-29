import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepositoryPort } from '@src/modules/user/database/user.repository.port';
import { USER_REPOSITORY } from '@src/modules/user/user.di-tokens';
import { LogoutCommand } from './logout.command';

@CommandHandler(LogoutCommand)
export class LogoutService implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: LogoutCommand): Promise<{ message: string }> {
    const { userName } = command;

    // Find the user by username
    const user = await this.userRepo.findByUsername(userName);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Optionally, log the logout action
    console.log(`✅ Logout thành công cho user: ${userName}`);

    return { message: 'Logout thành công' };
  }
}
