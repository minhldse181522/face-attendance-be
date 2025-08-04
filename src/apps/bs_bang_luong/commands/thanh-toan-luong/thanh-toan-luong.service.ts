import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { WebsocketService } from '@src/libs/websocket/websocket.service';
import { CreateNotificationCommand } from '@src/modules/notification/commands/create-notification/create-notification.command';
import { UpdatePayrollCommand } from '@src/modules/payroll/commands/update-payroll/update-payroll.command';
import { PayrollRepositoryPort } from '@src/modules/payroll/database/payroll.repository.port';
import { PayrollEntity } from '@src/modules/payroll/domain/payroll.entity';
import {
  PayrollAlreadyExistsError,
  PayrollAlreadyInUseError,
  PayrollNotFoundError,
} from '@src/modules/payroll/domain/payroll.error';
import { PAYROLL_REPOSITORY } from '@src/modules/payroll/payroll.di-tokens';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import {
  FindWorkingScheduleArrayStatusByParamsQuery,
  FindWorkingScheduleArrayStatusByParamsQueryResult,
} from '@src/modules/working-schedule/queries/find-working-schedule-array-status-by-params/find-working-schedule-array-status-by-params.query-handler';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleUserNotFound } from '../../domain/bang-luong.error';
import { ThanhToanLuongCommand } from './thanh-toan-luong.command';

export type ThanhToanLuongServiceResult = Result<
  PayrollEntity,
  | PayrollNotFoundError
  | PayrollAlreadyExistsError
  | PayrollAlreadyInUseError
  | WorkingScheduleUserNotFound
>;

@CommandHandler(ThanhToanLuongCommand)
export class ThanhToanLuongService
  implements ICommandHandler<ThanhToanLuongCommand>
{
  constructor(
    @Inject(PAYROLL_REPOSITORY)
    private readonly payrollRepo: PayrollRepositoryPort,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly websocketService: WebsocketService,
  ) {}

  async execute(
    command: ThanhToanLuongCommand,
  ): Promise<ThanhToanLuongServiceResult> {
    const found = await this.payrollRepo.findOneById(command.payrollId);
    if (found.isNone()) {
      return Err(new PayrollNotFoundError());
    }

    const luong = found.unwrap();
    const luongProps = luong.getProps();
    const userCode = luongProps.userCode;

    // Đi tìm lịch làm của nhân viên này (để chuyển status nếu là STOP)
    const workingScheduleResults: FindWorkingScheduleArrayStatusByParamsQueryResult =
      await this.queryBus.execute(
        new FindWorkingScheduleArrayStatusByParamsQuery({
          userCode,
          status: ['NOTSTARTED', 'ACTIVE'],
        }),
      );

    if (workingScheduleResults.isErr()) {
      return Err(new WorkingScheduleUserNotFound());
    }
    const workingScheduleProps = workingScheduleResults.unwrap();

    if (command.status === 'ACCEPT') {
      // Tạo ra Notification
      const result = await this.commandBus.execute(
        new CreateNotificationCommand({
          title: 'Đã thanh toán lương',
          message: 'Lương của bạn đã được thanh toán',
          type: command.status === 'ACCEPT' ? 'SUCCESS' : 'NOTSUCCESS',
          isRead: false,
          userCode: userCode,
          createdBy: 'system',
        }),
      );
      if (result.isErr()) {
        throw result.unwrapErr();
      }

      // Lấy NotificationEntity
      const createdNotification = result.unwrap();

      // Lấy plain object để gửi socket
      const { isRead, ...notificationPayload } = createdNotification.getProps();

      const safePayload = JSON.parse(
        JSON.stringify(notificationPayload, (_, val) =>
          typeof val === 'bigint' ? val.toString() : val,
        ),
      );

      await this.websocketService.publish({
        event: `NOTIFICATION_CREATED_${userCode}`,
        data: safePayload,
      });
      await this.commandBus.execute(
        new UpdatePayrollCommand({
          payrollId: luong.id,
          status: 'ACCEPT',
          updatedBy: command.updatedBy,
        }),
      );
      return Ok(luong);
    } else if (command.status === 'STOP') {
      for (const schedule of workingScheduleProps) {
        await this.commandBus.execute(
          new UpdateWorkingScheduleCommand({
            workingScheduleId: schedule.id,
            status: 'NOTWORK',
            updatedBy: 'system',
          }),
        );
      }
      // Tạo ra Notification
      const result = await this.commandBus.execute(
        new CreateNotificationCommand({
          title: 'Đã tất toán lương',
          message:
            'Đã tất toán lương của bạn và chuyển sang trạng thái không làm việc',
          type: command.status === 'STOP' ? 'SUCCESS' : 'NOTSUCCESS',
          isRead: false,
          userCode: userCode,
          createdBy: 'system',
        }),
      );
      if (result.isErr()) {
        throw result.unwrapErr();
      }

      // Lấy NotificationEntity
      const createdNotification = result.unwrap();

      // Lấy plain object để gửi socket
      const { isRead, ...notificationPayload } = createdNotification.getProps();

      const safePayload = JSON.parse(
        JSON.stringify(notificationPayload, (_, val) =>
          typeof val === 'bigint' ? val.toString() : val,
        ),
      );

      await this.websocketService.publish({
        event: `NOTIFICATION_CREATED_${userCode}`,
        data: safePayload,
      });
      await this.commandBus.execute(
        new UpdatePayrollCommand({
          payrollId: luong.id,
          status: 'STOP',
          updatedBy: command.updatedBy,
        }),
      );
      return Ok(luong);
    }
    return Ok(luong);
  }
}
