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
import {
  FindUserBranchByParamsQuery,
  FindUserBranchByParamsQueryResult,
} from '@src/modules/user-branch/queries/find-user-branch-by-params/find-user-branch-by-params.query-handler';
import { CreateUserBranchCommand } from '@src/modules/user-branch/commands/create-user-branch/create-user-branch.command';
import { DeleteUserBranchCommand } from '@src/modules/user-branch/commands/delete-user-branch/delete-user-branch.command';
import {
  FindUserBranchArrayByParamsQuery,
  FindUserBranchArrayByParamsQueryResult,
} from '@src/modules/user-branch/queries/find-user-branch-array-by-params/find-user-branch-array-by-params.query-handler';
import { GenerateCode } from '@src/libs/utils/generate-code.util';

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
    protected readonly generateCode: GenerateCode,
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
      const currentDate = new Date();

      // Tìm các lịch làm việc tương lai
      const futureWorkingSchedules: FindWorkingScheduleArrayStopByParamsQueryResult =
        await this.queryBus.execute(
          new FindWorkingScheduleArrayStopByParamsQuery({
            userCode: userContractProps.userCode!,
            status: ['NOTSTARTED', 'ACTIVE'],
            fromDate: currentDate,
          }),
        );

      if (futureWorkingSchedules.isOk()) {
        const workingScheduleProps = futureWorkingSchedules.unwrap();

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
      } else {
        console.warn(
          `[WARN] Không tìm thấy lịch làm việc tương lai cho user ${userContractProps.userCode}`,
        );
      }

      // Tìm payroll để cập nhật nếu có
      const currentMonth = `${currentDate.getMonth() + 1}/${currentDate
        .getFullYear()
        .toString()
        .slice(-2)}`;

      const timeKeepingOfUser: FindPayrollByParamsQueryResult =
        await this.queryBus.execute(
          new FindPayrollByParamsQuery({
            where: {
              userCode: userContractProps.userCode!,
              month: currentMonth,
            },
          }),
        );

      if (timeKeepingOfUser.isOk()) {
        await this.commandBus.execute(
          new UpdatePayrollCommand({
            payrollId: timeKeepingOfUser.unwrap().getProps().id,
            status: 'STOP',
            updatedBy: 'system',
          }),
        );
      } else {
        console.warn(
          `[WARN] Không tìm thấy bảng lương tháng ${currentMonth} cho user ${userContractProps.userCode}`,
        );
      }
    }

    // Xử lý cập nhật branch codes
    if (command.branchCodes !== undefined) {
      // Lấy tất cả user-branch hiện tại
      const existingUserBranches: FindUserBranchArrayByParamsQueryResult =
        await this.queryBus.execute(
          new FindUserBranchArrayByParamsQuery({
            where: {
              userContractCode: userContractProps.code,
            },
          }),
        );

      const existingBranchCodes = existingUserBranches.isOk()
        ? existingUserBranches.unwrap().map((ub) => ub.getProps().branchCode)
        : [];

      const newBranchCodes = command.branchCodes || [];

      // Xóa các branch codes không còn trong danh sách mới
      const branchCodesToDelete = existingBranchCodes.filter(
        (code) => !newBranchCodes.includes(code),
      );

      for (const branchCodeToDelete of branchCodesToDelete) {
        const userBranchToDelete = existingUserBranches.isOk()
          ? existingUserBranches
              .unwrap()
              .find((ub) => ub.getProps().branchCode === branchCodeToDelete)
          : null;

        if (userBranchToDelete) {
          await this.commandBus.execute(
            new DeleteUserBranchCommand({
              userBranchId: userBranchToDelete.getProps().id,
            }),
          );
        }
      }

      // Tạo mới các branch codes chưa tồn tại
      const branchCodesToCreate = newBranchCodes.filter(
        (code) => !existingBranchCodes.includes(code),
      );

      for (const branchCode of branchCodesToCreate) {
        const ubCode = await this.generateCode.generateCode('UB', 4);
        await this.commandBus.execute(
          new CreateUserBranchCommand({
            code: ubCode,
            branchCode: branchCode,
            userContractCode: userContractProps.code!,
            createdBy: 'system',
          }),
        );
      }
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
