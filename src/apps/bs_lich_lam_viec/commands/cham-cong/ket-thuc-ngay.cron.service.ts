import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';

@Injectable()
export class EndOfDayWorkingScheduleCronService {
  private readonly logger = new Logger(EndOfDayWorkingScheduleCronService.name);

  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    private readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  @Cron('59 23 * * *') // Chạy mỗi ngày lúc 23:59
  async handleEndOfDayCron() {
    await RequestContextService.runWithContext(
      { tenantId: 'default', user: { username: 'system' } },
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const schedules = await this.workingScheduleRepo.findAll({
          status: { in: ['NOTSTARTED', 'ACTIVE'] },
          date: {
            gte: today,
            lt: tomorrow,
          },
        });

        this.logger.log(
          `Found ${schedules.length} schedules to mark as NOTWORK`,
        );

        for (const schedule of schedules) {
          await this.commandBus.execute(
            new UpdateWorkingScheduleCommand({
              workingScheduleId: schedule.id,
              status: 'NOTWORK',
              updatedBy: 'system',
            }),
          );
          this.logger.log(
            `Updated status of schedule ${schedule.id} to NOTWORK`,
          );
        }
      },
    );
  }
}
