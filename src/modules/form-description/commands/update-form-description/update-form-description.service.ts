import { ConflictException, Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';
import { MinioService } from '@src/libs/minio/minio.service';
import { UpdatePayrollCommand } from '@src/modules/payroll/commands/update-payroll/update-payroll.command';
import { PayrollNotFoundError } from '@src/modules/payroll/domain/payroll.error';
import {
  FindPayrollByParamsQuery,
  FindPayrollByParamsQueryResult,
} from '@src/modules/payroll/queries/find-payroll-by-params/find-payroll-by-params.query-handler';
import {
  FindTimeKeepingByParamsQuery,
  FindTimeKeepingByParamsQueryResult,
} from '@src/modules/time-keeping/queries/find-time-keeping-by-params/find-time-keeping-by-params.query-handler';
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
  FindWorkingScheduleArrayStopByParamsQuery,
  FindWorkingScheduleArrayStopByParamsQueryResult,
} from '@src/modules/working-schedule/queries/find-working-schedule-array-stop-by-params/find-working-schedule-array-stop-by-params.query-handler';
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
  TimeKeepingAlreadyOverlap,
  UserContractToEndNotFoundError,
  UserToUpdateFaceNotFoundError,
  WorkingScheduleForOverTimeNotFoundError,
} from '../../domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';
import { UpdateFormDescriptionCommand } from './update-form-description.command';

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
          const futureWorkingSchedules: FindWorkingScheduleArrayByParamsQueryResult =
            await this.queryBus.execute(
              new FindWorkingScheduleArrayByParamsQuery({
                userCode: userProps.code,
                status: 'NOTSTARTED',
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
        }
        break;
      case '2':
        // Đơn tăng ca
        if (
          command.status === 'APPROVED' &&
          command.startTime &&
          command.endTime
        ) {
          const formDateOnly = normalizeDateOnly(new Date(command.startTime));
          const startOfDay = new Date(formDateOnly);
          const endOfDay = new Date(formDateOnly);
          endOfDay.setHours(23, 59, 59, 999);

          // Tìm trong ngày đó nhân viên này có làm việc không
          const workingScheduleFound: FindWorkingScheduleByParamsQueryResult =
            await this.queryBus.execute(
              new FindWorkingScheduleByParamsQuery({
                where: {
                  userCode: userSubmit,
                  date: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                },
              }),
            );
          if (workingScheduleFound.isErr()) {
            return Err(new WorkingScheduleFutureNotFoundError());
          }
          console.log('wsf', workingScheduleFound);

          // Kiểm tra xem người đó có đi làm ngày đó
          const timeKeepingResult: FindTimeKeepingByParamsQueryResult =
            await this.queryBus.execute(
              new FindTimeKeepingByParamsQuery({
                where: {
                  userCode: userSubmit,
                  date: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                  status: 'END',
                },
              }),
            );

          if (timeKeepingResult.isOk()) {
            const timeKeepingProps = timeKeepingResult.unwrap().getProps();
            const checkInTime = new Date(timeKeepingProps.checkInTime!);
            const checkoutTime = new Date(timeKeepingProps.checkOutTime!);

            const formStart = new Date(command.startTime);
            const formEnd = new Date(command.endTime);

            const isOverlap =
              (checkInTime <= formStart && checkoutTime >= formEnd) ||
              (checkInTime >= formStart && checkInTime <= formEnd) ||
              (checkoutTime >= formStart && checkoutTime <= formEnd);

            if (isOverlap) {
              return Err(new TimeKeepingAlreadyOverlap());
            }
          }

          await this.commandBus.execute(
            new UpdateFormDescriptionCommand({
              formDescriptionId: command.formDescriptionId,
              statusOvertime: true,
              updatedBy: command.updatedBy,
            }),
          );
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
          const futureWorkingSchedules: FindWorkingScheduleArrayStopByParamsQueryResult =
            await this.queryBus.execute(
              new FindWorkingScheduleArrayStopByParamsQuery({
                userCode: userContractProps.userCode!,
                status: 'NOTSTARTED',
                fromDate: currentDate,
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
        }
        break;
      case '6':
        // Đơn khác
        break;
      default:
        // Không xác định
        break;
    }

    const updatedResult = formDescription.update({
      ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
      approvedBy: currentUserCode,
      approvedTime: new Date(),
    });

    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedFormDescription =
        await this.formDescriptionRepo.update(formDescription);
      return Ok(updatedFormDescription);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new FormDescriptionAlreadyExistsError());
      }
      throw error;
    }
  }
}
