import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { GenerateWorkingDate } from '@src/libs/utils/generate-working-dates.util';
import { PositionNotFoundError } from '@src/modules/position/domain/position.error';
import { ShiftNotFoundError } from '@src/modules/shift/domain/shift.error';
import {
  FindShiftByParamsQuery,
  FindShiftByParamsQueryResult,
} from '@src/modules/shift/queries/find-shift-by-params/find-shift-by-params.query-handler';
import { TimeKeepingRepositoryPort } from '@src/modules/time-keeping/database/time-keeping.repository.port';
import { UserContractRepositoryPort } from '@src/modules/user-contract/database/user-contract.repository.port';
import { USER_CONTRACT_REPOSITORY } from '@src/modules/user-contract/user-contract.di-tokens';
import { CreateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/create-working-schedule/create-working-schedule.command';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '@src/modules/working-schedule/domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { addDays, endOfMonth } from 'date-fns';
import { Err, Ok, Result } from 'oxide.ts';
import {
  BranchNotBelongToContractError,
  ManagerNotAssignToUserError,
  NotGeneratedError,
  ShiftCreatedConflictError,
  UserContractDoesNotExistError,
  WorkingDateAlreadyExistError,
} from '../../domain/lich-lam-viec.error';
import { TIME_KEEPING_REPOSITORY } from './../../../../modules/time-keeping/time-keeping.di-tokens';
import {
  FindUserContractByParamsQuery,
  FindUserContractByParamsQueryResult,
} from './../../../../modules/user-contract/queries/find-user-contract-by-params/find-user-contract-by-params.query-handler';
import { CreateLichLamViecCommand } from './tao-lich-lam-viec.command';

export type CreateLichLamViecServiceResult = Result<
  WorkingScheduleEntity[],
  | WorkingScheduleNotFoundError
  | ManagerNotAssignToUserError
  | UserContractDoesNotExistError
  | ShiftNotFoundError
  | WorkingDateAlreadyExistError
  | BranchNotBelongToContractError
  | PositionNotFoundError
  | NotGeneratedError
  | ShiftCreatedConflictError
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
    const createWorkingDate = command.date;
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
              startTime: { lte: createWorkingDate },
              endTime: { gte: createWorkingDate },
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
      const shiftProps = checkExistShift.unwrap().getProps();
      const start = shiftProps.startTime;

      // Use UTC time directly
      const shiftStartTimeStr = `${start!.getUTCHours().toString().padStart(2, '0')}:${start!.getUTCMinutes().toString().padStart(2, '0')}`;
      console.log('>>> Raw shift startTime:', shiftProps.startTime);
      console.log('>>> UTC shift startTime:', shiftStartTimeStr);

      const end = shiftProps.endTime;
      const shiftEndTimeStr = `${end!.getUTCHours().toString().padStart(2, '0')}:${end!.getUTCMinutes().toString().padStart(2, '0')}`;
      console.log('>>> UTC shift endTime:', shiftEndTimeStr);

      //#region Tao Lich lam viec
      const fromDate = createWorkingDate;
      const toDate =
        command.optionCreate === 'THANG'
          ? endOfMonth(createWorkingDate)
          : command.optionCreate === 'TUAN'
            ? addDays(createWorkingDate, 6)
            : createWorkingDate;
      console.log('fromDate', fromDate);
      console.log('toDate', toDate);

      // Gọi truy vấn để lấy các ngày đã có
      const existingSchedules =
        await this.workingScheduleRepo.findWorkingSchedulesByUserAndDateRange(
          command.userCode,
          fromDate,
          toDate,
        );
      console.log('existingSchedules', existingSchedules);

      const existingSchedulesWithShift =
        await this.workingScheduleRepo.findWorkingSchedulesByUserAndDateRangeWithShift(
          command.userCode,
          fromDate,
          toDate,
        );
      console.log('existingSchedulesWithShift', existingSchedulesWithShift);

      const existingDates: Date[] = existingSchedules
        .map((ws) => ws.getProps().date)
        .filter((d): d is Date => d instanceof Date);

      const alreadyGeneratedShifts = existingSchedulesWithShift
        .map((ws) => {
          const props = ws.getProps();
          const date = props.date;
          const startTime = props.shift?.getProps().startTime;
          const endTime = props.shift?.getProps().endTime;

          if (!date || !startTime || !endTime) return null; // bỏ ca không đầy đủ thông tin

          // Use UTC time directly
          console.log('>>> Debug existing shift:', {
            originalStartTime: startTime,
            originalEndTime: endTime,
          });

          const startTimeStr = `${startTime.getUTCHours().toString().padStart(2, '0')}:${startTime.getUTCMinutes().toString().padStart(2, '0')}`;
          const endTimeStr = `${endTime.getUTCHours().toString().padStart(2, '0')}:${endTime.getUTCMinutes().toString().padStart(2, '0')}`;

          console.log('>>> Debug converted time:', {
            startUTC: startTime.toISOString(),
            endUTC: endTime.toISOString(),
            startTimeStr,
            endTimeStr,
          });

          return {
            date,
            startTime: startTimeStr,
            endTime: endTimeStr,
          };
        })
        .filter(
          (s): s is { date: Date; startTime: string; endTime: string } =>
            s !== null,
        ); // lọc null

      console.log(
        '>>> Already generated shifts (UTC time):',
        alreadyGeneratedShifts,
      );

      try {
        const workingDates = await this.generateWorkingDate.generateWorkingDate(
          createWorkingDate,
          command.optionCreate,
          command.holidayMode ?? [],
          existingDates,
          shiftEndTimeStr,
          shiftStartTimeStr,
          alreadyGeneratedShifts,
          command.isToday,
        );
        const results: WorkingScheduleEntity[] = [];

        for (const date of workingDates) {
          let generatedCode: string;
          let retryCount = 0;
          const maxRetries = 10;
          do {
            generatedCode = await this.generateCode.generateCode('WS', 4);
            const exists =
              await this.workingScheduleRepo.existsByCode(generatedCode);
            if (!exists) break;

            retryCount++;
            if (retryCount > maxRetries) {
              throw new Error(
                `Cannot generate unique code after ${maxRetries} tries`,
              );
            }
          } while (true);

          const createdWorkingSchedule = await this.commandBus.execute(
            new CreateWorkingScheduleCommand({
              code: generatedCode,
              userCode: command.userCode,
              userContractCode: userContractProps.code,
              date: date, // Use the date directly without creating a new Date object
              status: 'NOTSTARTED',
              shiftCode: command.shiftCode,
              branchCode: command.branchCode,
              createdBy: command.createdBy,
            }),
          );

          results.push(createdWorkingSchedule.unwrap());
        }
        //#endregion

        return Ok(results);
      } catch (error) {
        if (error instanceof ShiftCreatedConflictError) {
          return Err(new ShiftCreatedConflictError());
        }
        return Err(new NotGeneratedError());
      }
    } else {
      return Err(new ManagerNotAssignToUserError());
    }
  }
}
