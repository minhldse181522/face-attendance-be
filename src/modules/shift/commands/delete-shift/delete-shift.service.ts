import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ShiftRepositoryPort } from '../../database/shift.repository.port';
import { ShiftEntity } from '../../domain/shift.entity';
import { ShiftNotFoundError } from '../../domain/shift.error';
import { SHIFT_REPOSITORY } from '../../shift.di-tokens';
import { DeleteShiftCommand } from './delete-shift.command';

export type DeleteShiftServiceResult = Result<boolean, ShiftNotFoundError>;

@CommandHandler(DeleteShiftCommand)
export class DeleteShiftService implements ICommandHandler<DeleteShiftCommand> {
  constructor(
    @Inject(SHIFT_REPOSITORY)
    protected readonly shiftRepo: ShiftRepositoryPort,
  ) {}

  async execute(
    command: DeleteShiftCommand,
  ): Promise<DeleteShiftServiceResult> {
    try {
      const result = await this.shiftRepo.delete({
        id: command.shiftId,
      } as ShiftEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new ShiftNotFoundError(error));
      }

      throw error;
    }
  }
}
