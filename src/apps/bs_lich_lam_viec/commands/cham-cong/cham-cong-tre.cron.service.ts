import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';

@Injectable()
export class WorkingScheduleCronService {
  private readonly logger = new Logger(WorkingScheduleCronService.name);

  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    private readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const now = new Date();

    const pendingSchedules =
      await this.workingScheduleRepo.findManyPendingToday();

    for (const schedule of pendingSchedules) {
      const { id, date, shift } = schedule;

      if (!date || !shift?.startTime) {
        this.logger.warn(
          `Skipped schedule ID: ${id} due to missing date or shiftStartTime`,
        );
        continue;
      }

      const shiftStartTime = shift.startTime;
      const shiftStartDateTime = new Date(date);
      shiftStartDateTime.setUTCHours(shiftStartTime.getUTCHours());
      shiftStartDateTime.setUTCMinutes(shiftStartTime.getUTCMinutes());

      const deadline = new Date(shiftStartDateTime.getTime() + 60 * 60 * 1000);

      if (now > deadline) {
        this.logger.log(
          `Update NOTWORK for schedule ID: ${id} - missed check-in`,
        );
        await this.commandBus.execute(
          new UpdateWorkingScheduleCommand({
            workingScheduleId: id,
            status: 'NOTWORK',
            updatedBy: 'system',
          }),
        );
      }
    }
  }
}
