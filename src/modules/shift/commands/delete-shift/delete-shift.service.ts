import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ShiftRepositoryPort } from '../../database/shift.repository.port';
import { ShiftEntity } from '../../domain/shift.entity';
import { ShiftNotFoundError } from '../../domain/shift.error';
import { SHIFT_REPOSITORY } from '../../shift.di-tokens';
import { DeleteShiftCommand } from './delete-shift.command';
import { UpdateShiftCommand } from '../update-shift/update-shift.command';

export type DeleteShiftServiceResult = Result<boolean, ShiftNotFoundError>;

@CommandHandler(DeleteShiftCommand)
export class DeleteShiftService implements ICommandHandler<DeleteShiftCommand> {
  constructor(
    @Inject(SHIFT_REPOSITORY)
    protected readonly shiftRepo: ShiftRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: DeleteShiftCommand,
  ): Promise<DeleteShiftServiceResult> {
    const found = await this.shiftRepo.findOneById(command.shiftId);
    if (found.isNone()) {
      return Err(new ShiftNotFoundError());
    }

    try {
      const result = await this.commandBus.execute(
        new UpdateShiftCommand({
          shiftId: command.shiftId,
          status: command.status,
          updatedBy: found.unwrap().getProps().createdBy,
        }),
      );

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new ShiftNotFoundError(error));
      }

      throw error;
    }
  }
}
