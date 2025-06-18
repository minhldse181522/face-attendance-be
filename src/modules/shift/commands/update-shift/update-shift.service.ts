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
    const start = command.startTime
      ? new Date(command.startTime)
      : Shift.getProps().startTime;
    const end = command.endTime
      ? new Date(command.endTime)
      : Shift.getProps().endTime;

    let workingHours: number | null = null;
    let lunchBreak: string | null =
      command.lunchBreak ?? Shift.getProps().lunchBreak ?? null;

    if (start && end) {
      const startMs = start.getTime();
      const endMs = end.getTime();

      let durationMs =
        endMs >= startMs
          ? endMs - startMs
          : endMs + 24 * 60 * 60 * 1000 - startMs;

      let lunchMs = 0;
      if (lunchBreak) {
        const [hStr, mStr] = lunchBreak.split(':');
        const hours = parseInt(hStr, 10);
        const minutes = parseInt(mStr, 10);
        lunchMs = (hours * 60 + minutes) * 60 * 1000;
      }

      workingHours = (durationMs - lunchMs) / (1000 * 60 * 60);
      workingHours = Math.round(workingHours * 100) / 100;
    }

    const updatedResult = Shift.update({
      ...command.getExtendedProps<UpdateShiftCommand>(),
      startTime: start,
      endTime: end,
      lunchBreak,
      workingHours,
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
