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
import { Decimal } from '@prisma/client/runtime/library';

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

    const shift = found.unwrap();

    // Lấy thời gian start/end mới hoặc giữ nguyên nếu không truyền
    const start = command.startTime
      ? new Date(command.startTime)
      : shift.getProps().startTime;

    const end = command.endTime
      ? new Date(command.endTime)
      : shift.getProps().endTime;

    // Lấy lunchBreak hoặc giữ nguyên
    const lunchBreak: string | null =
      command.lunchBreak ?? shift.getProps().lunchBreak ?? null;

    let workingHours: number | null = null;

    if (start && end) {
      const startMs = start.getTime();
      const endMs = end.getTime();

      // Ca qua đêm
      const durationMs =
        endMs >= startMs
          ? endMs - startMs
          : endMs + 24 * 60 * 60 * 1000 - startMs;

      // Tính thời lượng nghỉ trưa
      let lunchMs = 0;
      if (lunchBreak) {
        const [hStr, mStr] = lunchBreak.split(':');
        const hours = parseInt(hStr || '0', 10);
        const minutes = parseInt(mStr || '0', 10);
        lunchMs = (hours * 60 + minutes) * 60 * 1000;
      }

      workingHours = (durationMs - lunchMs) / (1000 * 60 * 60);
      workingHours = Math.round(workingHours * 100) / 100;
    }

    // Gọi update entity
    const updatedResult = shift.update({
      ...command.getExtendedProps<UpdateShiftCommand>(),
      startTime: start,
      endTime: end,
      lunchBreak,
      workingHours: workingHours !== null ? new Decimal(workingHours) : null,
    });

    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedShift = await this.shiftRepo.update(shift);
      return Ok(updatedShift);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new ShiftAlreadyExistsError());
      }
      throw error;
    }
  }
}
