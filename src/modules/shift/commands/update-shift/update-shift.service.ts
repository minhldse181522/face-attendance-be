import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ShiftRepositoryPort } from '../../database/shift.repository.port';
import { ShiftEntity } from '../../domain/shift.entity';
import {
  ShiftAlreadyExistsError,
  ShiftAlreadyInUseError,
  ShiftNotFoundError,
} from '../../domain/shift.error';
import { SHIFT_REPOSITORY } from '../../shift.di-tokens';
import { UpdateShiftCommand } from './update-shift.command';

export type UpdateShiftServiceResult = Result<
  ShiftEntity,
  ShiftNotFoundError | ShiftAlreadyExistsError | ShiftAlreadyInUseError
>;

@CommandHandler(UpdateShiftCommand)
export class UpdateShiftService implements ICommandHandler<UpdateShiftCommand> {
  constructor(
    @Inject(SHIFT_REPOSITORY)
    private readonly shiftRepo: ShiftRepositoryPort,
  ) {}

  async execute(
    command: UpdateShiftCommand,
  ): Promise<UpdateShiftServiceResult> {
    const found = await this.shiftRepo.findOneById(command.shiftId);
    if (found.isNone()) {
      return Err(new ShiftNotFoundError());
    }

    const Shift = found.unwrap();
    const updatedResult = Shift.update({
      ...command.getExtendedProps<UpdateShiftCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedShift = await this.shiftRepo.update(Shift);
      return Ok(updatedShift);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new ShiftAlreadyExistsError());
      }
      throw error;
    }
  }
}
