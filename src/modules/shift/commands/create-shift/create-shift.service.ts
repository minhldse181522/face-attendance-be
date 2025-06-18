import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { Err, Ok, Result } from 'oxide.ts';
import { ShiftRepositoryPort } from '../../database/shift.repository.port';
import { ShiftEntity } from '../../domain/shift.entity';
import { ShiftAlreadyExistsError } from '../../domain/shift.error';
import { SHIFT_REPOSITORY } from '../../shift.di-tokens';
import { CreateShiftCommand } from './create-shift.command';

export type CreateShiftServiceResult = Result<
  ShiftEntity,
  ShiftAlreadyExistsError
>;

@CommandHandler(CreateShiftCommand)
export class CreateShiftService implements ICommandHandler<CreateShiftCommand> {
  constructor(
    @Inject(SHIFT_REPOSITORY)
    protected readonly shiftRepo: ShiftRepositoryPort,
    private readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreateShiftCommand,
  ): Promise<CreateShiftServiceResult> {
    const code = await this.generateCode.generateCode('SHIFT', 4);

    let workingHours: number | null = null;
    let start: Date | null = null;
    let end: Date | null = null;
    let lunchBreak: string | null = null;

    if (command.startTime && command.endTime) {
      start = new Date(command.startTime);
      end = new Date(command.endTime);

      let durationMs: number;
      const startMs = start.getTime();
      const endMs = end.getTime();

      if (endMs < startMs) {
        // Ca làm việc qua đêm (end nhỏ hơn start)
        durationMs = endMs + 24 * 60 * 60 * 1000 - startMs;
      } else {
        durationMs = endMs - startMs;
      }

      let lunchMs = 0;
      if (command.lunchBreak) {
        lunchBreak = command.lunchBreak;
        const [hoursStr, minutesStr] = lunchBreak.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        lunchMs = (hours * 60 + minutes) * 60 * 1000;
      }

      workingHours = (durationMs - lunchMs) / (1000 * 60 * 60); // đổi sang giờ
      workingHours = Math.round(workingHours * 100) / 100; // làm tròn 2 chữ số thập phân
    }

    const shift = ShiftEntity.create({
      code: code,
      name: command.name ?? null,
      startTime: start,
      endTime: end,
      lunchBreak: lunchBreak,
      workingHours: workingHours,
      createdBy: command.createdBy,
    });

    try {
      const createdShift = await this.shiftRepo.insert(shift);

      return Ok(createdShift);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new ShiftAlreadyExistsError());
      }

      throw error;
    }
  }
}
