import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleRepositoryPort } from '../../database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import {
  WorkingScheduleAlreadyExistsError,
  WorkingScheduleAlreadyInUseError,
  WorkingScheduleNotFoundError,
} from '../../domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '../../working-schedule.di-tokens';
import { UpdateWorkingScheduleCommand } from './update-working-schedule.command';

export type UpdateWorkingScheduleServiceResult = Result<
  WorkingScheduleEntity,
  | WorkingScheduleNotFoundError
  | WorkingScheduleAlreadyExistsError
  | WorkingScheduleAlreadyInUseError
>;

@CommandHandler(UpdateWorkingScheduleCommand)
export class UpdateWorkingScheduleService
  implements ICommandHandler<UpdateWorkingScheduleCommand>
{
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    private readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
  ) {}

  async execute(
    command: UpdateWorkingScheduleCommand,
  ): Promise<UpdateWorkingScheduleServiceResult> {
    const found = await this.workingScheduleRepo.findOneById(
      command.workingScheduleId,
    );
    if (found.isNone()) {
      return Err(new WorkingScheduleNotFoundError());
    }

    const workingSchedule = found.unwrap();
    const updatedResult = workingSchedule.update({
      ...command.getExtendedProps<UpdateWorkingScheduleCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedWorkingSchedule =
        await this.workingScheduleRepo.update(workingSchedule);
      return Ok(updatedWorkingSchedule);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new WorkingScheduleAlreadyExistsError());
      }
      throw error;
    }
  }
}
