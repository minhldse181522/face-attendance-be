import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteUserCommand } from './delete-user.command';
import { USER_REPOSITORY } from '../../user.di-tokens';
import { UserRepositoryPort } from '../../database/user.repository.port';
import { PrismaService } from '@src/libs/prisma/prisma.service';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { userId } = command;

    try {
      // First check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: BigInt(userId) },
      });
      
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Delete the user directly with Prisma
      await this.prisma.user.delete({
        where: { id: BigInt(userId) },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
