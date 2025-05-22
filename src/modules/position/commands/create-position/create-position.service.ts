import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { PositionRepositoryPort } from '../../database/position.repository.port';
import { PositionEntity } from '../../domain/position.entity';
import { PositionAlreadyExistsError } from '../../domain/position.error';
import { POSITION_REPOSITORY } from '../../position.di-tokens';
import { CreatePositionCommand } from './create-position.command';

export type CreatePositionServiceResult = Result<
  PositionEntity,
  PositionAlreadyExistsError
>;

@CommandHandler(CreatePositionCommand)
export class CreatePositionService
  implements ICommandHandler<CreatePositionCommand>
{
  constructor(
    @Inject(POSITION_REPOSITORY)
    protected readonly positionRepo: PositionRepositoryPort,
  ) {}

  async execute(
    command: CreatePositionCommand,
  ): Promise<CreatePositionServiceResult> {
    const Position = PositionEntity.create({
      ...command.getExtendedProps<CreatePositionCommand>(),
    });

    try {
      const createdPosition = await this.positionRepo.insert(Position);
      return Ok(createdPosition);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new PositionAlreadyExistsError());
      }

      throw error;
    }
  }
}
