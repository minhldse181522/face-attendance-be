import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { RoleRepositoryPort } from '../../database/role.repository.port';
import { RoleEntity } from '../../domain/role.entity';
import {
  RoleAlreadyExistsError,
  RoleAlreadyInUseError,
  RoleNotFoundError,
} from '../../domain/role.error';
import { ROLE_REPOSITORY } from '../../role.di-tokens';
import { UpdateRoleCommand } from './update-role.command';

export type UpdateRoleServiceResult = Result<
  RoleEntity,
  RoleNotFoundError | RoleAlreadyExistsError | RoleAlreadyInUseError
>;

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleService implements ICommandHandler<UpdateRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepo: RoleRepositoryPort,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<UpdateRoleServiceResult> {
    const found = await this.roleRepo.findOneById(command.roleId);
    if (found.isNone()) {
      return Err(new RoleNotFoundError());
    }

    const Role = found.unwrap();
    const updatedResult = Role.update({
      ...command.getExtendedProps<UpdateRoleCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedRole = await this.roleRepo.update(Role);
      return Ok(updatedRole);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new RoleAlreadyExistsError());
      }
      throw error;
    }
  }
}
