import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleRepositoryPort } from '../../database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '../../domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '../../working-schedule.di-tokens';
import { DeleteWorkingScheduleCommand } from './delete-working-schedule.command';

export type DeleteWorkingScheduleServiceResult = Result<
  boolean,
  WorkingScheduleNotFoundError
>;

@CommandHandler(DeleteWorkingScheduleCommand)
export class DeleteWorkingScheduleService
  implements ICommandHandler<DeleteWorkingScheduleCommand>
{
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
  ) {}

  async execute(
    command: DeleteWorkingScheduleCommand,
  ): Promise<DeleteWorkingScheduleServiceResult> {
    try {
      const result = await this.workingScheduleRepo.delete({
        id: command.workingScheduleId,
      } as WorkingScheduleEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new WorkingScheduleNotFoundError(error));
      }

      throw error;
    }
  }
}
