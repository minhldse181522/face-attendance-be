import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { PositionRepositoryPort } from '../../database/position.repository.port';
import { PositionEntity } from '../../domain/position.entity';
import {
  PositionAlreadyExistsError,
  PositionAlreadyInUseError,
  PositionNotFoundError,
} from '../../domain/position.error';
import { POSITION_REPOSITORY } from '../../position.di-tokens';
import { UpdatePositionCommand } from './update-branch.command';

export type UpdatePositionServiceResult = Result<
  PositionEntity,
  PositionNotFoundError | PositionAlreadyExistsError | PositionAlreadyInUseError
>;

@CommandHandler(UpdatePositionCommand)
export class UpdatePositionService
  implements ICommandHandler<UpdatePositionCommand>
{
  constructor(
    @Inject(POSITION_REPOSITORY)
    private readonly positionRepo: PositionRepositoryPort,
  ) {}

  async execute(
    command: UpdatePositionCommand,
  ): Promise<UpdatePositionServiceResult> {
    const found = await this.positionRepo.findOneById(command.positionId);
    if (found.isNone()) {
      return Err(new PositionNotFoundError());
    }

    const Position = found.unwrap();
    const updatedResult = Position.update({
      ...command.getExtendedProps<UpdatePositionCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedPosition = await this.positionRepo.update(Position);
      return Ok(updatedPosition);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new PositionAlreadyExistsError());
      }
      throw error;
    }
  }
}
