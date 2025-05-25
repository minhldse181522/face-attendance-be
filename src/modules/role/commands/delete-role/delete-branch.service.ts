import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { RoleRepositoryPort } from '../../database/role.repository.port';
import { RoleEntity } from '../../domain/role.entity';
import { RoleNotFoundError } from '../../domain/role.error';
import { ROLE_REPOSITORY } from '../../role.di-tokens';
import { DeleteRoleCommand } from './delete-role.command';

export type DeleteRoleServiceResult = Result<boolean, RoleNotFoundError>;

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleService implements ICommandHandler<DeleteRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    protected readonly RoleRepo: RoleRepositoryPort,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<DeleteRoleServiceResult> {
    try {
      const result = await this.RoleRepo.delete({
        id: command.roleId,
      } as RoleEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new RoleNotFoundError(error));
      }

      throw error;
    }
  }
}
