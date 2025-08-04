import { ConflictException, Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { MinioService } from '@src/libs/minio/minio.service';
import { UpdatePayrollCommand } from '@src/modules/payroll/commands/update-payroll/update-payroll.command';
import { PayrollNotFoundError } from '@src/modules/payroll/domain/payroll.error';
import {
  FindPayrollByParamsQuery,
  FindPayrollByParamsQueryResult,
} from '@src/modules/payroll/queries/find-payroll-by-params/find-payroll-by-params.query-handler';
import {
  FindManyTimeKeepingByParamsQuery,
  FindManyTimeKeepingByParamsQueryResult,
} from '@src/modules/time-keeping/queries/find-many-time-keeping-by-params/find-many-time-keeping-by-params.query-handler';
import { UpdateUserContractCommand } from '@src/modules/user-contract/commands/update-user-contract/update-user-contract.command';
import { WorkingScheduleFutureNotFoundError } from '@src/modules/user-contract/domain/user-contract.error';
import {
  FindUserContractByParamsQuery,
  FindUserContractByParamsQueryResult,
} from '@src/modules/user-contract/queries/find-user-contract-by-params/find-user-contract-by-params.query-handler';
import { UpdateUserCommand } from '@src/modules/user/commands/update-user/update-user.command';
import {
  FindUserByParamsQuery,
  FindUserByParamsQueryResult,
} from '@src/modules/user/queries/find-user-by-params/find-user-by-params.query-handler';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import {
  FindWorkingScheduleArrayByParamsQuery,
  FindWorkingScheduleArrayByParamsQueryResult,
} from '@src/modules/working-schedule/queries/find-working-schedule-array-by-params/find-working-schedule-array-by-params.query-handler';
import {
  FindWorkingScheduleByParamsQuery,
  FindWorkingScheduleByParamsQueryResult,
} from '@src/modules/working-schedule/queries/find-working-schedule-by-params/find-working-schedule-by-params.query-handler';
import { Err, Ok, Result } from 'oxide.ts';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import {
  FormDescriptionAlreadyExistsError,
  FormDescriptionNotFoundError,
  FormDescriptionUpdateNotAllowedError,
  InvalidFormStatusError,
  TimeKeepingAlreadyOverlap,
  UserContractToEndNotFoundError,
  UserToUpdateFaceNotFoundError,
  WorkingScheduleForOverTimeNotFoundError,
} from '../../domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';
import { UpdateFormDescriptionCommand } from './update-form-description.command';
import { FormAlreadyExistsError } from '@src/modules/form/domain/form.error';
import { CreateNotificationCommand } from '@src/modules/notification/commands/create-notification/create-notification.command';
import { WebsocketService } from '@src/libs/websocket/websocket.service';
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';
import {
  FindWorkingScheduleArrayStatusByParamsQuery,
  FindWorkingScheduleArrayStatusByParamsQueryResult,
} from '@src/modules/working-schedule/queries/find-working-schedule-array-status-by-params/find-working-schedule-array-status-by-params.query-handler';

export type UpdateFormDescriptionServiceResult = Result<
  FormDescriptionEntity,
  | FormDescriptionNotFoundError
  | FormDescriptionAlreadyExistsError
  | FormDescriptionUpdateNotAllowedError
  | UserToUpdateFaceNotFoundError
  | UserContractToEndNotFoundError
  | WorkingScheduleFutureNotFoundError
  | PayrollNotFoundError
  | WorkingScheduleForOverTimeNotFoundError
  | TimeKeepingAlreadyOverlap
  | InvalidFormStatusError
  | FormAlreadyExistsError
>;

function normalizeDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

@CommandHandler(UpdateFormDescriptionCommand)
export class UpdateFormDescriptionService
  implements ICommandHandler<UpdateFormDescriptionCommand>
{
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    private readonly formDescriptionRepo: FormDescriptionRepositoryPort,
    private readonly minioService: MinioService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly websocketService: WebsocketService,
  ) {}

  async execute(
    command: UpdateFormDescriptionCommand,
  ): Promise<UpdateFormDescriptionServiceResult> {
    const found = await this.formDescriptionRepo.findOneById(
      command.formDescriptionId,
    );
    if (found.isNone()) {
      return Err(new FormDescriptionNotFoundError());
    }

    const user = RequestContextService.getRequestUser();
    const currentUserCode = user?.code;

    const formDescription = found.unwrap();
    const fileImage = formDescription.getProps().file;
    const userSubmit = formDescription.getProps().submittedBy;

    // Tìm user nộp đơn để update
    const userFound: FindUserByParamsQueryResult = await this.queryBus.execute(
      new FindUserByParamsQuery({
        where: {
          code: userSubmit,
        },
      }),
    );

    if (userFound.isErr()) {
      return Err(new UserToUpdateFaceNotFoundError());
    }

    const userProps = userFound.unwrap().getProps();
    const userName = userProps.userName;
    const userId = userProps.id;

    switch (formDescription.getProps().formId.toString()) {
      case '1':
        // Đơn vắng mặt
        if (
          command.status === 'APPROVED' &&
          command.startTime &&
          command.endTime
        ) {
          const startTime = command.startTime;
          const endTime = command.endTime;

          // Kiểm tra thời gian bắt đầu và kết thúc
          if (startTime >= endTime) {
            return Err(new FormDescriptionUpdateNotAllowedError());
          }

          // Cập nhật lịch làm việc của người nộp đơn
          const futureWorkingSchedules: FindWorkingScheduleArrayStatusByParamsQueryResult =
            await this.queryBus.execute(
              new FindWorkingScheduleArrayStatusByParamsQuery({
                userCode: userProps.code,
                status: ['NOTSTARTED', 'ACTIVE'],
                startDate: new Date(command.startTime),
                endDate: new Date(command.endTime),
              }),
            );

          if (futureWorkingSchedules.isErr()) {
            return Err(new WorkingScheduleFutureNotFoundError());
          }

          const workingScheduleProps = futureWorkingSchedules.unwrap();

          // Cập nhật trạng thái của tất cả lịch làm việc tương lai
          for (const schedule of workingScheduleProps) {
            await this.commandBus.execute(
              new UpdateWorkingScheduleCommand({
                workingScheduleId: schedule.id,
                status: 'NOTWORK',
                note: `Đơn vắng mặt đã được phê duyệt từ ${startTime.toISOString()} đến ${endTime.toISOString()}`,
                updatedBy: 'system',
              }),
            );
          }

          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            approvedBy: currentUserCode,
            approvedTime: new Date(),
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }

          // Tạo ra Notification
          const result = await this.commandBus.execute(
            new CreateNotificationCommand({
              title: 'Đơn vắng mặt',
              message: 'Đơn vắng mặt của bạn đã được phê duyệt thành công.',
              type: command.status === 'APPROVED' ? 'SUCCESS' : 'NOTSUCCESS',
              isRead: false,
              userCode: userSubmit,
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
            event: `NOTIFICATION_CREATED_${userSubmit}`,
            data: safePayload,
          });

          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }
        break;
      case '2':
        if (
          command.status === 'APPROVED' &&
          command.startTime &&
          command.endTime
        ) {
          const formStart = new Date(command.startTime);
          const formEnd = new Date(command.endTime);

          // Lấy ngày bắt đầu của form
          const formDateOnly = normalizeDateOnly(formStart);
          const startOfDay = new Date(formDateOnly);
          const endOfDay = new Date(formDateOnly);
          endOfDay.setHours(23, 59, 59, 999);

          // Truy vấn tất cả timekeeping trong ngày đó với status 'END'
          const timeKeepingResult: FindManyTimeKeepingByParamsQueryResult =
            await this.queryBus.execute(
              new FindManyTimeKeepingByParamsQuery({
                where: {
                  userCode: userSubmit,
                  date: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                },
              }),
            );
          if (timeKeepingResult.isOk()) {
            const timeKeepings = timeKeepingResult.unwrap();
            // Lọc các bản ghi có checkInTime và checkOutTime đầy đủ
            const validTimeKeepings = timeKeepings.filter(
              (tk) => tk.getProps().checkInTime && tk.getProps().checkOutTime,
            );
            const isOverlap = validTimeKeepings.some((tk) => {
              const checkInTime = new Date(tk.getProps().checkInTime!);
              const checkOutTime = new Date(tk.getProps().checkOutTime!);
              return (
                (checkInTime <= formStart && checkOutTime >= formEnd) ||
                (checkInTime >= formStart && checkInTime <= formEnd) ||
                (checkOutTime >= formStart && checkOutTime <= formEnd)
              );
            });

            if (isOverlap) {
              return Err(new TimeKeepingAlreadyOverlap());
            }
          }

          // Nếu không có timekeeping hoặc không bị overlap => update form
          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            status: 'APPROVED',
            statusOvertime: true,
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }

          // Tạo ra Notification
          const result = await this.commandBus.execute(
            new CreateNotificationCommand({
              title: 'Đơn làm thêm giờ',
              message: 'Đơn làm thêm giờ của bạn đã được phê duyệt thành công.',
              type: command.status === 'APPROVED' ? 'SUCCESS' : 'NOTSUCCESS',
              isRead: false,
              userCode: userSubmit,
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
            event: `NOTIFICATION_CREATED_${userSubmit}`,
            data: safePayload,
          });

          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }

        break;
      case '3':
        // Đơn quên chấm công
        if (command.status === 'APPROVED') {
          // Nếu là đơn quên check-in + check-out -> cần cả startTime và endTime
          if (command.startTime && command.endTime) {
            const startDate = new Date(command.startTime);
            const dateOnly = new Date(
              Date.UTC(
                startDate.getUTCFullYear(),
                startDate.getUTCMonth(),
                startDate.getUTCDate(),
              ),
            );
            // Tìm trong ngày đó nhân viên này có làm việc không
            const workingScheduleFound: FindWorkingScheduleByParamsQueryResult =
              await this.queryBus.execute(
                new FindWorkingScheduleByParamsQuery({
                  where: {
                    userCode: userSubmit,
                    date: dateOnly,
                  },
                }),
              );
            if (workingScheduleFound.isErr()) {
              return Err(new WorkingScheduleFutureNotFoundError());
            }
            const workingScheduleProps = workingScheduleFound
              .unwrap()
              .getProps();
            // Cập nhật trạng thái làm việc của người nộp đơn sang FORGET
            await this.commandBus.execute(
              new UpdateWorkingScheduleCommand({
                workingScheduleId: workingScheduleProps.id,
                status: 'FORGET',
                updatedBy: 'system',
              }),
            );
          }
          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            approvedBy: currentUserCode,
            approvedTime: new Date(),
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }

          // Tạo ra Notification
          const result = await this.commandBus.execute(
            new CreateNotificationCommand({
              title: 'Đơn quên chấm công',
              message:
                'Đơn quên chấm công của bạn đã được phê duyệt thành công.',
              type: command.status === 'APPROVED' ? 'SUCCESS' : 'NOTSUCCESS',
              isRead: false,
              userCode: userSubmit,
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
            event: `NOTIFICATION_CREATED_${userSubmit}`,
            data: safePayload,
          });

          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }
        break;
      case '4':
        // Đơn thôi việc
        // Đi chuyển trạng thái hợp đồng của user -> INACTIVE
        if (command.status === 'APPROVED') {
          const userEndJobContract: FindUserContractByParamsQueryResult =
            await this.queryBus.execute(
              new FindUserContractByParamsQuery({
                where: { userCode: userSubmit, status: 'ACTIVE' },
              }),
            );

          if (userEndJobContract.isErr()) {
            return Err(new UserContractToEndNotFoundError());
          }

          const userContractProps = userEndJobContract.unwrap().getProps();
          await this.commandBus.execute(
            new UpdateUserContractCommand({
              userContractId: userContractProps.id,
              status: 'INACTIVE',
              updatedBy: command.updatedBy,
            }),
          );

          // Cập nhật toàn bộ trạng thái workingSchedule của người nộp đơn
          const currentDate = new Date();
          const futureWorkingSchedules: FindWorkingScheduleArrayByParamsQueryResult =
            await this.queryBus.execute(
              new FindWorkingScheduleArrayByParamsQuery({
                userCode: userContractProps.userCode!,
                status: 'NOTSTARTED',
              }),
            );
          if (futureWorkingSchedules.isErr()) {
            return Err(new WorkingScheduleFutureNotFoundError());
          }
          const workingScheduleProps = futureWorkingSchedules.unwrap();

          // Cập nhật trạng thái của tất cả lịch làm việc tương lai
          for (const schedule of workingScheduleProps) {
            await this.commandBus.execute(
              new UpdateWorkingScheduleCommand({
                workingScheduleId: schedule.id,
                status: 'NOTWORK',
                note: `${userSubmit} đã thôi việc vào ngày ${currentDate.toISOString()}`,
                updatedBy: 'system',
              }),
            );
          }

          // Cập nhật bảng lương của nguời nộp đơn
          const currentMonth = `${currentDate.getMonth() + 1}/${currentDate.getFullYear().toString().slice(-2)}`;
          // Tìm user trong bảng lương để cập nhật trạng thái
          const timeKeepingOfUser: FindPayrollByParamsQueryResult =
            await this.queryBus.execute(
              new FindPayrollByParamsQuery({
                where: {
                  userCode: userContractProps.userCode!,
                  month: currentMonth,
                },
              }),
            );
          if (timeKeepingOfUser.isErr()) {
            return Err(new PayrollNotFoundError());
          }

          await this.commandBus.execute(
            new UpdatePayrollCommand({
              payrollId: timeKeepingOfUser.unwrap().getProps().id,
              status: 'STOP',
              updatedBy: 'system',
            }),
          );

          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            approvedBy: currentUserCode,
            approvedTime: new Date(),
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }

          // Tạo ra Notification
          const result = await this.commandBus.execute(
            new CreateNotificationCommand({
              title: 'Đơn thôi việc',
              message: 'Đơn thôi việc của bạn đã được phê duyệt thành công.',
              type: command.status === 'APPROVED' ? 'SUCCESS' : 'NOTSUCCESS',
              isRead: false,
              userCode: userSubmit,
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
            event: `NOTIFICATION_CREATED_${userSubmit}`,
            data: safePayload,
          });

          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }
        break;
      case '5':
        // Đơn xác thực khuôn mặt
        if (command.status === 'APPROVED' && fileImage) {
          const fileUrl = new URL(fileImage);
          const objectName = fileUrl.pathname.replace(
            /^\/faceattendance\//,
            '',
          );
          const newObjectName = `face/${userName}.jpg`;

          await this.minioService.copy({
            sourceObjectName: objectName,
            targetObjectName: newObjectName,
          });

          const publicUrl = `${this.minioService.getPublicEndpoint()}/${this.minioService['_bucketName']}/${newObjectName}?v=${Date.now()}`;

          await this.commandBus.execute(
            new UpdateUserCommand({
              userId: userId,
              faceImg: publicUrl,
              updatedBy: 'system',
            }),
          );

          // Tạo ra Notification
          const result = await this.commandBus.execute(
            new CreateNotificationCommand({
              title: 'Đơn cập nhật khuôn mặt',
              message: 'Khuôn mặt của bạn đã được cập nhật thành công.',
              type: command.status === 'APPROVED' ? 'SUCCESS' : 'NOTSUCCESS',
              isRead: false,
              userCode: userSubmit,
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
            event: `NOTIFICATION_CREATED_${userSubmit}`,
            data: { ...safePayload, formId: '5' },
          });

          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            approvedBy: currentUserCode,
            approvedTime: new Date(),
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }
          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }
        break;
      case '6':
        // Đơn khác
        if (command.status === 'APPROVED') {
          // Tạo ra Notification
          const result = await this.commandBus.execute(
            new CreateNotificationCommand({
              title: 'Đơn khác',
              message: 'Đơn của bạn đã được phê duyệt thành công.',
              type: 'SUCCESS',
              isRead: false,
              userCode: userSubmit,
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
            event: `NOTIFICATION_CREATED_${userSubmit}`,
            data: safePayload,
          });

          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            approvedBy: currentUserCode,
            approvedTime: new Date(),
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }

          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }

        if (command.status === 'REJECTED') {
          // Tạo ra Notification cho trường hợp từ chối
          const result = await this.commandBus.execute(
            new CreateNotificationCommand({
              title: 'Đơn khác',
              message: 'Đơn của bạn đã bị từ chối.',
              type: 'NOTSUCCESS',
              isRead: false,
              userCode: userSubmit,
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
            event: `NOTIFICATION_CREATED_${userSubmit}`,
            data: safePayload,
          });

          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            approvedBy: currentUserCode,
            approvedTime: new Date(),
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }

          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }

        if (command.status === 'CANCELED') {
          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            status: 'CANCELED',
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }
          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }
        break;
      default:
        if (command.status === 'APPROVED' || command.status === 'REJECTED') {
          // Tạo ra Notification
          const result = await this.commandBus.execute(
            new CreateNotificationCommand({
              title: 'Đơn khác',
              message:
                command.status === 'APPROVED'
                  ? 'Đơn của bạn đã được phê duyệt thành công.'
                  : 'Đơn của bạn đã bị từ chối.',
              type: command.status === 'APPROVED' ? 'SUCCESS' : 'NOTSUCCESS',
              isRead: false,
              userCode: userSubmit,
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
            event: `NOTIFICATION_CREATED_${userSubmit}`,
            data: safePayload,
          });

          const updatedResult = formDescription.update({
            ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
            approvedBy: currentUserCode,
            approvedTime: new Date(),
          });
          if (updatedResult.isErr()) {
            return updatedResult;
          }

          try {
            const updatedForm =
              await this.formDescriptionRepo.update(formDescription);
            return Ok(updatedForm);
          } catch (error: any) {
            if (error instanceof ConflictException) {
              return Err(new FormAlreadyExistsError());
            }
            throw error;
          }
        }
        // Không xác định
        return Err(new InvalidFormStatusError());
    }
    if (command.status === 'REJECTED') {
      // Tạo ra Notification cho trường hợp từ chối
      const result = await this.commandBus.execute(
        new CreateNotificationCommand({
          title: 'Đơn từ bị từ chối',
          message: 'Đơn từ của bạn đã bị từ chối.',
          type: 'NOTSUCCESS',
          isRead: false,
          userCode: userSubmit,
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
        event: `NOTIFICATION_CREATED_${userSubmit}`,
        data: safePayload,
      });

      const updatedResult = formDescription.update({
        ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
        approvedBy: currentUserCode,
        approvedTime: new Date(),
      });
      if (updatedResult.isErr()) {
        return updatedResult;
      }
      try {
        const updatedForm =
          await this.formDescriptionRepo.update(formDescription);
        return Ok(updatedForm);
      } catch (error: any) {
        if (error instanceof ConflictException) {
          return Err(new FormAlreadyExistsError());
        }
        throw error;
      }
    }
    if (command.status === 'CANCELED') {
      const updatedResult = formDescription.update({
        ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
        status: 'CANCELED',
      });
      if (updatedResult.isErr()) {
        return updatedResult;
      }
      try {
        const updatedForm =
          await this.formDescriptionRepo.update(formDescription);
        return Ok(updatedForm);
      } catch (error: any) {
        if (error instanceof ConflictException) {
          return Err(new FormAlreadyExistsError());
        }
        throw error;
      }
    }
    return Ok(formDescription);
  }
}
