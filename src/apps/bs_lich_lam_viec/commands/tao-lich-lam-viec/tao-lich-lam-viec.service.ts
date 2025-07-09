import { TIME_KEEPING_REPOSITORY } from './../../../../modules/time-keeping/time-keeping.di-tokens';
import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { GenerateWorkingDate } from '@src/libs/utils/generate-working-dates.util';
import { ShiftNotFoundError } from '@src/modules/shift/domain/shift.error';
import {
  FindShiftByParamsQuery,
  FindShiftByParamsQueryResult,
} from '@src/modules/shift/queries/find-shift-by-params/find-shift-by-params.query-handler';
import { UserContractRepositoryPort } from '@src/modules/user-contract/database/user-contract.repository.port';
import { USER_CONTRACT_REPOSITORY } from '@src/modules/user-contract/user-contract.di-tokens';
import { CreateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/create-working-schedule/create-working-schedule.command';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '@src/modules/working-schedule/domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { addDays, endOfMonth } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
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
import { CreatePayrollCommand } from '@src/modules/payroll/commands/create-payroll/create-payroll.command';
import { TimeKeepingRepositoryPort } from '@src/modules/time-keeping/database/time-keeping.repository.port';
import { FindPositionQueryResult } from '@src/modules/position/queries/find-positions/find-positions.query-handler';
import {
  FindPositionByParamsQuery,
  FindPositionByParamsQueryResult,
} from '@src/modules/position/queries/find-position-by-params/find-postion-by-params.query-handler';
import { PositionNotFoundError } from '@src/modules/position/domain/position.error';

export type CreateLichLamViecServiceResult = Result<
  WorkingScheduleEntity[],
  | WorkingScheduleNotFoundError
  | ManagerNotAssignToUserError
  | UserContractDoesNotExistError
  | ShiftNotFoundError
  | WorkingDateAlreadyExistError
  | BranchNotBelongToContractError
  | PositionNotFoundError
>;

@CommandHandler(CreateLichLamViecCommand)
export class CreateLichLamViecService
  implements ICommandHandler<CreateLichLamViecCommand>
{
  constructor(
    @Inject(USER_CONTRACT_REPOSITORY)
    protected readonly userContractRepo: UserContractRepositoryPort,
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    @Inject(TIME_KEEPING_REPOSITORY)
    protected readonly timeKeepingRepo: TimeKeepingRepositoryPort,
    protected readonly generateCode: GenerateCode,
    protected readonly generateWorkingDate: GenerateWorkingDate,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: CreateLichLamViecCommand,
  ): Promise<CreateLichLamViecServiceResult> {
    const timeZone = 'Asia/Ho_Chi_Minh';
    // Convert command.date (UTC) → về giờ Việt Nam
    const localDate = toZonedTime(command.date, timeZone);

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
              startTime: { lte: localDate },
              endTime: { gte: localDate },
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

      //#region Tao Lich lam viec
      const fromDate = localDate;
      const toDate =
        command.optionCreate === 'THANG'
          ? endOfMonth(localDate)
          : command.optionCreate === 'TUAN'
            ? addDays(localDate, 6)
            : localDate;

      // Gọi truy vấn để lấy các ngày đã có
      const existingSchedules =
        await this.workingScheduleRepo.findWorkingSchedulesByUserAndDateRange(
          command.userCode,
          fromDate,
          toDate,
        );

      const existingDates: Date[] = existingSchedules
        .map((ws) => ws.getProps().date)
        .filter((d): d is Date => d instanceof Date);

      try {
        const workingDates = await this.generateWorkingDate.generateWorkingDate(
          localDate,
          command.optionCreate,
          command.holidayMode ?? [],
          existingDates,
        );
        const results: WorkingScheduleEntity[] = [];

        for (const date of workingDates) {
          let generatedCode: string;
          let retryCount = 0;
          do {
            generatedCode = await this.generateCode.generateCode('WS', 4);
            const exists =
              await this.workingScheduleRepo.existsByCode(generatedCode);
            if (!exists) break;

            retryCount++;
            if (retryCount > 5) {
              throw new Error(
                `Cannot generate unique code after ${retryCount} tries`,
              );
            }
          } while (true);

          const createdWorkingSchedule = await this.commandBus.execute(
            new CreateWorkingScheduleCommand({
              code: generatedCode,
              userCode: command.userCode,
              userContractCode: userContractProps.code,
              date: new Date(date),
              status: 'NOTSTARTED',
              shiftCode: command.shiftCode,
              branchCode: command.branchCode,
              createdBy: command.createdBy,
            }),
          );

          results.push(createdWorkingSchedule.unwrap());
        }
        //#endregion

        //#region Tao Bang Luong
        // Đi tìm trong timeKeeping xem đã có bao nhiêu status END | LATE
        const finishWorkDate = await this.timeKeepingRepo.findFinishWorkDate();

        // Đi tìm position để gắn các giá trị vào bảng lương
        const findInitSalary: FindPositionByParamsQueryResult =
          await this.queryBus.execute(
            new FindPositionByParamsQuery({
              where: {
                code: userContractProps.positionCode,
              },
            }),
          );
        if (findInitSalary.isErr()) {
          return Err(new PositionNotFoundError());
        }
        const positionProps = findInitSalary.unwrap().getProps();

        // Tạo mới bảng lương với user đó
        const month = localDate.getMonth() + 1;
        const year = localDate.getFullYear() % 100;
        const formattedMonth = `${month}/${year}`;
        await this.commandBus.execute(
          new CreatePayrollCommand({
            userCode: command.userCode,
            month: formattedMonth,
            baseSalary: positionProps.baseSalary ?? 0,
            workDay: finishWorkDate,
            allowance: positionProps.allowance ?? 0,
            overtimeSalary: positionProps.overtimeSalary ?? 0,
            lateFine: positionProps.lateFine ?? 0,
            totalSalary:
              positionProps.baseSalary! +
              positionProps.allowance! +
              positionProps.overtimeSalary! -
              positionProps.lateFine!,
            createdBy: 'system',
          }),
        );
        //#endregion

        return Ok(results);
      } catch (error) {
        return Err(new WorkingScheduleNotFoundError());
      }
    } else {
      return Err(new ManagerNotAssignToUserError());
    }
  }
}
