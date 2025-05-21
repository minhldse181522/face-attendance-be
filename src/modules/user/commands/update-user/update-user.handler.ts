import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import { USER_REPOSITORY } from '../../user.di-tokens';
import { UserRepositoryPort } from '../../database/user.repository.port';
import { UserMapper } from '../../mappers/user.mapper';
import { UserResponseDto } from '../../dtos/user.response.dto';
import { PrismaService } from '@src/libs/prisma/prisma.service';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly mapper: UserMapper,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserResponseDto> {
    const { userId, dto } = command;
    
    try {
      // First check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: BigInt(userId) },
      });
      
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Prepare update data object, only including fields that are provided
      const updateData: any = {};
      if (dto.userName) updateData.userName = dto.userName;
      if (dto.firstName) updateData.firstName = dto.firstName;
      if (dto.lastName) updateData.lastName = dto.lastName;
      if (dto.email) updateData.email = dto.email;
      if (dto.phone) updateData.phone = dto.phone;
      if (dto.address) updateData.address = dto.address;
      if (dto.roleCode) updateData.roleCode = dto.roleCode;
      
      // Add update metadata
      updateData.updatedAt = new Date();
      updateData.updatedBy = 'system'; // This should be the current user's ID
      
      // Update user directly with Prisma
      const updatedUserData = await this.prisma.user.update({
        where: { id: BigInt(userId) },
        data: updateData,
      });
      
      // Convert Prisma model to domain entity
      const updatedUserEntity = this.mapper.toDomain(updatedUserData);
      
      // Map to response DTO
      return this.mapper.toResponse(updatedUserEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}
