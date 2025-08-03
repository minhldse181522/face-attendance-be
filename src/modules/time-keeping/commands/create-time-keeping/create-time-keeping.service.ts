import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { Err, Ok, Result } from 'oxide.ts';
import { TimeKeepingRepositoryPort } from '../../database/time-keeping.repository.port';
import { TimeKeepingEntity } from '../../domain/time-keeping.entity';
import { TimeKeepingAlreadyExistsError } from '../../domain/time-keeping.error';
import { TIME_KEEPING_REPOSITORY } from '../../time-keeping.di-tokens';
import { CreateTimeKeepingCommand } from './create-time-keeping.command';

export type CreateTimeKeepingServiceResult = Result<
  TimeKeepingEntity,
  TimeKeepingAlreadyExistsError
>;

@CommandHandler(CreateTimeKeepingCommand)
export class CreateTimeKeepingService
  implements ICommandHandler<CreateTimeKeepingCommand>
{
  constructor(
    @Inject(TIME_KEEPING_REPOSITORY)
    protected readonly timeKeepingRepo: TimeKeepingRepositoryPort,
    private readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreateTimeKeepingCommand,
  ): Promise<CreateTimeKeepingServiceResult> {
    // Use the code from the command if provided, otherwise generate a new one
    const code =
      command.code || (await this.generateCode.generateCode('TK', 4));
    // let workingHourReal: number;
    // if (command.checkInTime && command.checkOutTime) {
    //   workingHourReal = command.checkOutTime - command.checkInTime;
    // }
    const TimeKeeping = TimeKeepingEntity.create({
      code: code,
      ...command.getExtendedProps<CreateTimeKeepingCommand>(),
    });

    try {
      const createdTimeKeeping = await this.timeKeepingRepo.insert(TimeKeeping);

      return Ok(createdTimeKeeping);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new TimeKeepingAlreadyExistsError());
      }

      throw error;
    }
  }
}
