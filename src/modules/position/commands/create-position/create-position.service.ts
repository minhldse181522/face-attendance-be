import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';

import { Err, Ok, Result } from 'oxide.ts';
import { PositionRepositoryPort } from '../../database/position.repository.port';
import { PositionEntity } from '../../domain/position.entity';
import { PositionAlreadyExistsError } from '../../domain/position.error';
import { CreatePositionCommand } from './create-position.command';
import { POSITION_REPOSITORY } from '../../position.di-tokens';

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
    protected readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreatePositionCommand,
  ): Promise<CreatePositionServiceResult> {
    const code = await this.generateCode.generateCode('POS', 4);
    const position = PositionEntity.create({
      code: code,
      ...command.getExtendedProps<CreatePositionCommand>(),
    });

    try {
      const createdPosition = await this.positionRepo.insert(position);
      return Ok(createdPosition);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new PositionAlreadyExistsError());
      }

      throw error;
    }
  }
}
