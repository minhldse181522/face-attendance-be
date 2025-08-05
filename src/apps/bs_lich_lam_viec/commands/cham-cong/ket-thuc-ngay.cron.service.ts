import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Cron } from '@nestjs/schedule';
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';
import { UpdateTimeKeepingCommand } from '@src/modules/time-keeping/commands/update-time-keeping/update-time-keeping.command';
import {
  FindTimeKeepingByParamsQuery,
  FindTimeKeepingByParamsQueryResult,
} from '@src/modules/time-keeping/queries/find-time-keeping-by-params/find-time-keeping-by-params.query-handler';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { getTodayUTC7, getTomorrowUTC7 } from '@src/libs/utils/generate-working-dates.util';

@Injectable()
export class EndOfDayWorkingScheduleCronService {
  private readonly logger = new Logger(EndOfDayWorkingScheduleCronService.name);

  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    private readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}



  @Cron('59 23 * * *') // Chạy mỗi ngày lúc 23:59
  async handleEndOfDayCron() {
    await RequestContextService.runWithContext(
      { tenantId: 'default', user: { username: 'system' } },
      async () => {
        // Sử dụng múi giờ UTC-7 thay vì múi giờ local
        const today = getTodayUTC7();
        const tomorrow = getTomorrowUTC7();

        this.logger.log(`Processing end of day for UTC-7 date: ${today.toISOString()}`);

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

          const timeKeepingFound: FindTimeKeepingByParamsQueryResult =
            await this.queryBus.execute(
              new FindTimeKeepingByParamsQuery({
                where: {
                  workingScheduleCode: schedule.getProps().code,
                },
              }),
            );
          if (timeKeepingFound.isErr()) {
            this.logger.error(
              `Failed to find time keeping for schedule ${schedule.id}`,
            );
            continue;
          }
          const timeKeepingProps = timeKeepingFound.unwrap().getProps();
          await this.commandBus.execute(
            new UpdateTimeKeepingCommand({
              timeKeepingId: timeKeepingProps.id,
              status: 'NOCHECKOUT',
              updatedBy: 'system',
            }),
          );
        }
      },
    );
  }
}
