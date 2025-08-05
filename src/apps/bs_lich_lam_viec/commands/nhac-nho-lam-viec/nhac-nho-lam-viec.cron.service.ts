import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';
import { WebsocketService } from '@src/libs/websocket/websocket.service';
import { CreateNotificationCommand } from '@src/modules/notification/commands/create-notification/create-notification.command';
import { UpdateNotificationCommand } from '@src/modules/notification/commands/update-notification/update-notification.command';
import {
  FindNotificationByParamsQuery,
  FindNotificationByParamsQueryResult,
} from '@src/modules/notification/queries/find-notification-by-params/find-notification-by-params.query-handler';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import {
  getTodayUTC7,
  getTomorrowUTC7,
} from '@src/libs/utils/generate-working-dates.util';

@Injectable()
export class EndOfDayWorkingScheduleCronService {
  private readonly logger = new Logger(EndOfDayWorkingScheduleCronService.name);
  private notifiedSchedules: Set<string> = new Set(); // Track đã thông báo

  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    private readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly websocketService: WebsocketService,
  ) {
    // Reset tracking mỗi ngày vào 0h
    this.resetNotificationTracking();
  }

  private resetNotificationTracking() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.notifiedSchedules.clear();
      this.logger.log('Reset notification tracking for new day');
      // Set up recurring reset
      setInterval(
        () => {
          this.notifiedSchedules.clear();
          this.logger.log('Reset notification tracking for new day');
        },
        24 * 60 * 60 * 1000,
      ); // Reset mỗi 24h
    }, timeUntilMidnight);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleNotiBeforeWorkCron() {
    await RequestContextService.runWithContext(
      { tenantId: 'default', user: { username: 'system' } },
      async () => {
        // Sử dụng múi giờ UTC-7 thay vì múi giờ local
        const today = getTodayUTC7();
        const tomorrow = getTomorrowUTC7();

        this.logger.log(
          `Processing notifications for UTC-7 date: ${today.toISOString()}`,
        );

        // Lấy tất cả lịch làm việc NOTSTARTED trong ngày hôm nay
        const schedules = await this.workingScheduleRepo.findAll({
          status: 'NOTSTARTED',
          date: {
            gte: today,
            lt: tomorrow,
          },
        });

        this.logger.log(
          `Found ${schedules.length} schedules to check for 30-minute notification`,
        );

        for (const schedule of schedules) {
          const userCodeEachSchedule = schedule.getProps().userCode;
          const shift = schedule.getProps().shift;
          const scheduleDate = schedule.getProps().date;
          const scheduleCode = schedule.getProps().code;

          // Kiểm tra đã thông báo cho lịch này chưa
          if (this.notifiedSchedules.has(scheduleCode!)) {
            continue;
          }

          // Kiểm tra nếu shift và date tồn tại
          if (!shift || !scheduleDate) {
            this.logger.warn(`Schedule ${scheduleCode} missing shift or date`);
            continue;
          }

          const shiftProps = shift.getProps();
          const shiftStartTime = shiftProps.startTime;

          if (!shiftStartTime) {
            this.logger.warn(
              `Schedule ${scheduleCode} missing shift start time`,
            );
            continue;
          }

          // Tạo datetime cho shift start time dựa trên ngày của schedule
          const shiftStartDateTime = new Date(scheduleDate);
          const startHour = shiftStartTime.getUTCHours();
          const startMinute = shiftStartTime.getUTCMinutes();
          shiftStartDateTime.setUTCHours(startHour, startMinute, 0, 0);

          // Lấy thời gian hiện tại theo UTC
          const now = new Date();

          // Tính thời gian còn lại đến khi bắt đầu shift
          const timeUntilStart = shiftStartDateTime.getTime() - now.getTime();
          const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));

          // Chỉ thông báo nếu còn từ 25-35 phút (buffer để tránh spam)
          if (minutesUntilStart < 25 || minutesUntilStart > 35) {
            continue;
          }

          // Đánh dấu đã thông báo cho lịch này
          this.notifiedSchedules.add(scheduleCode!);

          this.logger.log(
            `Sending 30-minute notification for schedule ${scheduleCode}, user: ${userCodeEachSchedule}, minutes until start: ${minutesUntilStart}`,
          );

          // Tạo title cố định, mỗi user chỉ có 1 notification "Nhắc nhở làm việc"
          const notificationTitle = 'Nhắc nhở làm việc';
          const notificationMessage = `Bạn có lịch làm việc ca ${shiftProps.name || 'N/A'} trong ${minutesUntilStart} phút nữa (${shiftStartDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}), nhớ chấm công nhé!`;

          // Tìm notification hiện có của user (không quan tâm ngày tạo)
          const findNotiExist: FindNotificationByParamsQueryResult =
            await this.queryBus.execute(
              new FindNotificationByParamsQuery({
                where: {
                  userCode: userCodeEachSchedule!,
                  title: notificationTitle,
                },
              }),
            );
          if (findNotiExist.isErr()) {
            const result = await this.commandBus.execute(
              new CreateNotificationCommand({
                title: notificationTitle,
                message: notificationMessage,
                type: 'SUCCESS',
                isRead: false,
                userCode: userCodeEachSchedule!,
                createdBy: 'system',
              }),
            );
            if (result.isErr()) {
              throw result.unwrapErr();
            }

            // Lấy NotificationEntity
            const createdNotification = result.unwrap();

            // Lấy plain object để gửi socket
            const { isRead, ...notificationPayload } =
              createdNotification.getProps();

            const safePayload = JSON.parse(
              JSON.stringify(notificationPayload, (_, val) =>
                typeof val === 'bigint' ? val.toString() : val,
              ),
            );

            await this.websocketService.publish({
              event: `NOTIFICATION_CREATED_${userCodeEachSchedule}`,
              data: { ...safePayload },
            });
          } else {
            const result = await this.commandBus.execute(
              new UpdateNotificationCommand({
                notificationId: findNotiExist.unwrap().getProps().id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'SUCCESS',
                isRead: false,
                updatedBy: 'system',
              }),
            );
            if (result.isErr()) {
              throw result.unwrapErr();
            }

            // Lấy NotificationEntity
            const createdNotification = result.unwrap();

            // Lấy plain object để gửi socket
            const { isRead, ...notificationPayload } =
              createdNotification.getProps();

            const safePayload = JSON.parse(
              JSON.stringify(notificationPayload, (_, val) =>
                typeof val === 'bigint' ? val.toString() : val,
              ),
            );

            await this.websocketService.publish({
              event: `NOTIFICATION_CREATED_${userCodeEachSchedule}`,
              data: { ...safePayload },
            });
          }
        }
      },
    );
  }
}
