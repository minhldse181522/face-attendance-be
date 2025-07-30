import { ConflictException, Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { UpdatePayrollCommand } from '@src/modules/payroll/commands/update-payroll/update-payroll.command';
import {
  FindPayrollByParamsQuery,
  FindPayrollByParamsQueryResult,
} from '@src/modules/payroll/queries/find-payroll-by-params/find-payroll-by-params.query-handler';
import { TimeKeepingNotFoundError } from '@src/modules/time-keeping/domain/time-keeping.error';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import {
  FindWorkingScheduleArrayStopByParamsQuery,
  FindWorkingScheduleArrayStopByParamsQueryResult,
} from '@src/modules/working-schedule/queries/find-working-schedule-array-stop-by-params/find-working-schedule-array-stop-by-params.query-handler';
import { Err, Ok, Result } from 'oxide.ts';
import { UserContractRepositoryPort } from '../../database/user-contract.repository.port';
import { UserContractEntity } from '../../domain/user-contract.entity';
import {
  UserContractAlreadyExistsError,
  UserContractAlreadyInUseError,
  UserContractNotFoundError,
  WorkingScheduleFutureNotFoundError,
} from '../../domain/user-contract.error';
import { USER_CONTRACT_REPOSITORY } from '../../user-contract.di-tokens';
import { UpdateUserContractCommand } from './update-user-contract.command';

export type UpdateUserContractServiceResult = Result<
  UserContractEntity,
  | UserContractNotFoundError
  | UserContractAlreadyExistsError
  | UserContractAlreadyInUseError
  | WorkingScheduleFutureNotFoundError
  | TimeKeepingNotFoundError
>;

@CommandHandler(UpdateUserContractCommand)
export class UpdateUserContractService
  implements ICommandHandler<UpdateUserContractCommand>
{
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    private readonly userContractRepo: UserContractRepositoryPort,
    protected readonly queryBus: QueryBus,
    protected readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: UpdateUserContractCommand,
  ): Promise<UpdateUserContractServiceResult> {
    const found = await this.userContractRepo.findOneById(
      command.userContractId,
    );
    if (found.isNone()) {
      return Err(new UserContractNotFoundError());
    }
    const currentDate = new Date();

    const userContract = found.unwrap();
    const userContractProps = userContract.getProps();

    // Kiểm tra nếu dừng hợp đồng (INACTIVE)
    if (command.status === 'INACTIVE') {
      // Lấy ngày hiện tại
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
            note: `Hợp đồng đã được chấm dứt vào ngày ${currentDate.toISOString()}`,
            updatedBy: 'system',
          }),
        );
      }

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
        return Err(new TimeKeepingNotFoundError());
      }

      await this.commandBus.execute(
        new UpdatePayrollCommand({
          payrollId: timeKeepingOfUser.unwrap().getProps().id,
          status: 'STOP',
          updatedBy: 'system',
        }),
      );
    }

    const updatedResult = userContract.update({
      ...command.getExtendedProps<UpdateUserContractCommand>(),
      endDate: currentDate,
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedUserContract =
        await this.userContractRepo.update(userContract);
      return Ok(updatedUserContract);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new UserContractAlreadyExistsError());
      }
      throw error;
    }
  }
}
