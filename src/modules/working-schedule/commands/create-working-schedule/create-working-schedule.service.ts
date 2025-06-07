import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleRepositoryPort } from '../../database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import { WorkingScheduleAlreadyExistsError } from '../../domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '../../working-schedule.di-tokens';
import { CreateWorkingScheduleCommand } from './create-working-schedule.command';

export type CreateWorkingScheduleServiceResult = Result<
  WorkingScheduleEntity,
  WorkingScheduleAlreadyExistsError
>;

@CommandHandler(CreateWorkingScheduleCommand)
export class CreateWorkingScheduleService
  implements ICommandHandler<CreateWorkingScheduleCommand>
{
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    private readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreateWorkingScheduleCommand,
  ): Promise<CreateWorkingScheduleServiceResult> {
    const code = await this.generateCode.generateCode('WS', 4);
    const workingSchedule = WorkingScheduleEntity.create({
      code: code,
      ...command.getExtendedProps<CreateWorkingScheduleCommand>(),
    });

    try {
      const createdContract =
        await this.workingScheduleRepo.insert(workingSchedule);

      return Ok(createdContract);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new WorkingScheduleAlreadyExistsError());
      }

      throw error;
    }
  }
}
