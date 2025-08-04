import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { Err, Ok, Result } from 'oxide.ts';
import { ShiftRepositoryPort } from '../../database/shift.repository.port';
import { ShiftEntity } from '../../domain/shift.entity';
import { ShiftAlreadyExistsError } from '../../domain/shift.error';
import { SHIFT_REPOSITORY } from '../../shift.di-tokens';
import { CreateShiftCommand } from './create-shift.command';
import { Decimal } from '@prisma/client/runtime/library';

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
    let workingHours: number | null = null;
    let start: Date | null = null;
    let end: Date | null = null;
    let lunchBreak: string | null = null;

    if (command.startTime && command.endTime) {
      start = new Date(command.startTime); // giữ nguyên UTC
      end = new Date(command.endTime); // giữ nguyên UTC

      const startMs = start.getTime();
      const endMs = end.getTime();

      // Tính tổng thời gian ca làm
      let durationMs =
        endMs >= startMs
          ? endMs - startMs
          : endMs + 24 * 60 * 60 * 1000 - startMs; // ca qua đêm

      // Tính thời gian nghỉ trưa
      let lunchMs = 0;
      if (command.lunchBreak) {
        lunchBreak = command.lunchBreak;
        const [hoursStr, minutesStr] = lunchBreak.split(':');
        const hours = parseInt(hoursStr || '0', 10);
        const minutes = parseInt(minutesStr || '0', 10);
        lunchMs = (hours * 60 + minutes) * 60 * 1000;
      }

      workingHours = (durationMs - lunchMs) / (1000 * 60 * 60);
      workingHours = Math.round(workingHours * 100) / 100;
    }
    let code: string;
    let retryCount = 0;
    const maxRetries = 10;

    do {
      code = await this.generateCode.generateCode('SHIFT', 4);
      const isExisted = await this.shiftRepo.checkExist(code);
      if (!isExisted) break;

      retryCount++;
      if (retryCount > maxRetries) {
        throw new Error(
          `Cannot generate unique code after ${maxRetries} tries`,
        );
      }
    } while (true);

    const shift = ShiftEntity.create({
      code: code,
      name: command.name ?? null,
      startTime: start,
      endTime: end,
      status: 'ACTIVE',
      lunchBreak: lunchBreak,
      workingHours: workingHours !== null ? new Decimal(workingHours) : null,
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
