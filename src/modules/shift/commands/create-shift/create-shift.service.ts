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
    const code = await this.generateCode.generateCode('WS', 4);
    const shift = ShiftEntity.create({
      code: code,
      ...command.getExtendedProps<CreateShiftCommand>(),
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
