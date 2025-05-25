import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { RoleRepositoryPort } from '../../database/role.repository.port';
import { RoleEntity } from '../../domain/role.entity';
import { RoleAlreadyExistsError } from '../../domain/role.error';
import { ROLE_REPOSITORY } from '../../role.di-tokens';
import { CreateRoleCommand } from './create-role.command';

export type CreateRoleServiceResult = Result<
  RoleEntity,
  RoleAlreadyExistsError
>;

@CommandHandler(CreateRoleCommand)
export class CreateRoleService implements ICommandHandler<CreateRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    protected readonly roleRepo: RoleRepositoryPort,
  ) {}

  async execute(command: CreateRoleCommand): Promise<CreateRoleServiceResult> {
    const Role = RoleEntity.create({
      ...command.getExtendedProps<CreateRoleCommand>(),
    });

    try {
      const createdRole = await this.roleRepo.insert(Role);
      return Ok(createdRole);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new RoleAlreadyExistsError());
      }

      throw error;
    }
  }
}
