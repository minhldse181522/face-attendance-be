import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { ShiftNotFoundError } from '@src/modules/shift/domain/shift.error';
import {
  FindShiftByParamsQuery,
  FindShiftByParamsQueryResult,
} from '@src/modules/shift/queries/find-shift-by-params/find-shift-by-params.query-handler';
import { UserContractRepositoryPort } from '@src/modules/user-contract/database/user-contract.repository.port';
import { USER_CONTRACT_REPOSITORY } from '@src/modules/user-contract/user-contract.di-tokens';
import { CreateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/create-working-schedule/create-working-schedule.command';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '@src/modules/working-schedule/domain/working-schedule.error';
import { Err, Ok, Result } from 'oxide.ts';
import {
  BranchNotBelongToContractError,
  ManagerNotAssignToUserError,
  UserContractDoesNotExistError,
  WorkingDateAlreadyExistError,
} from '../../domain/lich-lam-viec.error';
import {
  FindUserContractByParamsQuery,
  FindUserContractByParamsQueryResult,
} from './../../../../modules/user-contract/queries/find-user-contract-by-params/find-user-contract-by-params.query-handler';
import { CreateLichLamViecCommand } from './tao-lich-lam-viec.command';
import { GenerateWorkingDate } from '@src/libs/utils/generate-working-dates.util';

export type CreateLichLamViecServiceResult = Result<
  WorkingScheduleEntity[],
  | WorkingScheduleNotFoundError
  | ManagerNotAssignToUserError
  | UserContractDoesNotExistError
  | ShiftNotFoundError
  | WorkingDateAlreadyExistError
  | BranchNotBelongToContractError
>;

@CommandHandler(CreateLichLamViecCommand)
export class CreateLichLamViecService
  implements ICommandHandler<CreateLichLamViecCommand>
{
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    protected readonly userContractRepo: UserContractRepositoryPort,
    protected readonly generateCode: GenerateCode,
    protected readonly generateWorkingDate: GenerateWorkingDate,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: CreateLichLamViecCommand,
  ): Promise<CreateLichLamViecServiceResult> {
    // Đảm bảo người tạo là quản lý của nhân viên đó
    const checkManager = await this.userContractRepo.checkManagedBy(
      command.createdBy,
    );
    if (checkManager) {
      // Check user có hợp đồng hợp lệ
      const checkValidUserContract: FindUserContractByParamsQueryResult =
        await this.queryBus.execute(
          new FindUserContractByParamsQuery({
            where: {
              userCode: command.userCode,
              startTime: { lte: command.date },
              endTime: { gte: command.date },
              status: 'ACTIVE',
            },
          }),
        );
      if (checkValidUserContract.isErr()) {
        return Err(new UserContractDoesNotExistError());
      }
      const userContractProps = checkValidUserContract.unwrap().getProps();

      // check chi nhánh nằm trong chuỗi chi nhánh của hợp đồng
      // const allowedBranchCodes =
      //   userContractProps.userBranches?.map(
      //     (branch) => branch.getProps().branchCode,
      //   ) ?? [];

      // console.log('Allowed branch codes:', allowedBranchCodes);

      // if (!allowedBranchCodes?.includes(command.branchCode)) {
      //   return Err(new BranchNotBelongToContractError());
      // }

      // check ca làm có tồn tại
      const checkExistShift: FindShiftByParamsQueryResult =
        await this.queryBus.execute(
          new FindShiftByParamsQuery({
            where: {
              code: command.shiftCode,
            },
          }),
        );
      if (checkExistShift.isErr()) {
        return Err(new ShiftNotFoundError());
      }

      try {
        const workingDates = await this.generateWorkingDate.generateWorkingDate(
          command.date,
          command.optionCreate,
          command.holidayMode ?? [],
        );
        const results: WorkingScheduleEntity[] = [];

        for (const date of workingDates) {
          const code = await this.generateCode.generateCode('WS', 4);
          const createdWorkingSchedule = await this.commandBus.execute(
            new CreateWorkingScheduleCommand({
              code: code,
              userCode: command.userCode,
              userContractCode: userContractProps.code,
              date: date,
              status: 'NOTSTARTED',
              shiftCode: command.shiftCode,
              branchCode: command.branchCode,
              createdBy: command.createdBy,
            }),
          );

          results.push(createdWorkingSchedule.unwrap());
        }

        return Ok(results);
      } catch (error) {
        console.error('🔥 Lỗi thực sự xảy ra:', error);
        return Err(new WorkingScheduleNotFoundError());
      }
    } else {
      return Err(new ManagerNotAssignToUserError());
    }
  }
}
