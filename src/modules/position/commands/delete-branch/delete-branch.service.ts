import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { PositionRepositoryPort } from '../../database/position.repository.port';
import { PositionEntity } from '../../domain/position.entity';
import { PositionNotFoundError } from '../../domain/position.error';
import { POSITION_REPOSITORY } from '../../position.di-tokens';
import { DeletePositionCommand } from './delete-branch.command';

export type DeletePositionServiceResult = Result<
  boolean,
  PositionNotFoundError
>;

@CommandHandler(DeletePositionCommand)
export class DeletePositionService
  implements ICommandHandler<DeletePositionCommand>
{
  constructor(
    @Inject(POSITION_REPOSITORY)
    protected readonly positionRepo: PositionRepositoryPort,
  ) {}

  async execute(
    command: DeletePositionCommand,
  ): Promise<DeletePositionServiceResult> {
    try {
      const result = await this.positionRepo.delete({
        id: command.positionId,
      } as PositionEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new PositionNotFoundError(error));
      }

      throw error;
    }
  }
}
