import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { CreateTimeKeepingCommand } from '@src/modules/time-keeping/commands/create-time-keeping/create-time-keeping.command';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '@src/modules/working-schedule/domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { Err, Ok, Result } from 'oxide.ts';
import {
  AlreadyCheckInError,
  ChamCongKhongDuDieuKienError,
  CheckInTimeNotInContractError,
  CheckInTooEarlyError,
  LateCheckInError,
} from '../../domain/lich-lam-viec.error';
import {
  FindUserContractByParamsQuery,
  FindUserContractByParamsQueryResult,
} from './../../../../modules/user-contract/queries/find-user-contract-by-params/find-user-contract-by-params.query-handler';
import { ChamCongCommand } from './cham-cong.command';
import {
  FindTimeKeepingByParamsQuery,
  FindTimeKeepingByParamsQueryResult,
} from '@src/modules/time-keeping/queries/find-time-keeping-by-params/find-time-keeping-by-params.query-handler';
import { TimeKeepingAlreadyExistsError } from '@src/modules/time-keeping/domain/time-keeping.error';
import {
  FindShiftByParamsQuery,
  FindShiftByParamsQueryResult,
} from '@src/modules/shift/queries/find-shift-by-params/find-shift-by-params.query-handler';
import { ShiftNotFoundError } from '@src/modules/shift/domain/shift.error';
import { getShiftStartDateTime } from '@src/libs/utils/get-shift-start-time.util';

export type ChamCongServiceResult = Result<
  WorkingScheduleEntity,
  | WorkingScheduleNotFoundError
  | ChamCongKhongDuDieuKienError
  | CheckInTimeNotInContractError
  | AlreadyCheckInError
  | LateCheckInError
  | ShiftNotFoundError
  | CheckInTooEarlyError
  | TimeKeepingAlreadyExistsError
>;

@CommandHandler(ChamCongCommand)
export class UpdateChamCongService implements ICommandHandler<ChamCongCommand> {
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    protected readonly generateCode: GenerateCode,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ChamCongCommand): Promise<ChamCongServiceResult> {
    const found = await this.workingScheduleRepo.findOneById(
      command.workingScheduleId,
    );
    if (found.isNone()) {
      return Err(new WorkingScheduleNotFoundError());
    }
    const workingSchedule = found.unwrap();
    const workingScheduleProps = found.unwrap().getProps();

    // Lấy startTime từ shift để kiểm tra
    const shiftFound: FindShiftByParamsQueryResult =
      await this.queryBus.execute(
        new FindShiftByParamsQuery({
          where: {
            code: workingScheduleProps.shiftCode,
          },
        }),
      );
    if (shiftFound.isErr()) {
      return Err(new ShiftNotFoundError());
    }
    const workingDate = new Date(workingScheduleProps.date!);
    const shiftStartTime = shiftFound.unwrap().getProps().startTime;
    const checkinTime = new Date(command.checkInTime!);

    // Kiểm tra checkin ko trễ quá 1 tiếng
    const shiftStartDateTime = getShiftStartDateTime(
      workingDate,
      shiftStartTime!,
    );

    const checkInTooEarlyLimit = new Date(
      shiftStartDateTime.getTime() - 2 * 60 * 60 * 1000,
    ); // trước 2 tiếng
    const checkInValidStart = new Date(
      shiftStartDateTime.getTime() - 60 * 60 * 1000,
    ); // Trước 1 tiếng
    const checkInValidEnd = new Date(
      shiftStartDateTime.getTime() + 5 * 60 * 1000,
    ); // Sau 5p
    const allowedCheckInDeadline = new Date(
      shiftStartDateTime.getTime() + 60 * 60 * 1000,
    ); // Sau 1 tiếng

    // Checkin quá sớm
    if (checkinTime < checkInTooEarlyLimit) {
      return Err(new CheckInTooEarlyError());
    }
    if (checkinTime < checkInValidStart) {
      return Err(new CheckInTooEarlyError());
    }

    const isLate = checkinTime > checkInValidEnd;

    // Checkin trễ 1 tiếng
    if (checkinTime > allowedCheckInDeadline) {
      await this.commandBus.execute(
        new UpdateWorkingScheduleCommand({
          workingScheduleId: workingScheduleProps.id,
          status: 'NOTWORK',
          updatedBy: 'system',
        }),
      );
      return Err(new LateCheckInError());
    }

    // Kiếm tra 1 ngày không checkin 2 lần
    const alreadyCheckIn: FindTimeKeepingByParamsQueryResult =
      await this.queryBus.execute(
        new FindTimeKeepingByParamsQuery({
          where: {
            workingScheduleCode: workingScheduleProps.code,
          },
        }),
      );
    if (alreadyCheckIn.isOk()) {
      return Err(new AlreadyCheckInError());
    }

    // Kiểm tra thời gian checkin có nằm trong thời hạn hợp đồng
    const checkInTimeValidInContract: FindUserContractByParamsQueryResult =
      await this.queryBus.execute(
        new FindUserContractByParamsQuery({
          where: {
            AND: [
              {
                userCode: command.userCode,
              },
              {
                startTime: { lte: command.checkInTime },
                endTime: {
                  gte: command.checkInTime,
                },
              },
            ],
          },
        }),
      );
    if (checkInTimeValidInContract.isErr()) {
      return Err(new CheckInTimeNotInContractError());
    }
    if (workingSchedule && command.checkInTime) {
      await this.commandBus.execute(
        new UpdateWorkingScheduleCommand({
          workingScheduleId: workingScheduleProps.id,
          status: 'ACTIVE',
          updatedBy: command.updatedBy,
        }),
      );

      // insert vào bảng time keeping
      const timeKeepingResult = await this.commandBus.execute(
        new CreateTimeKeepingCommand({
          checkInTime: command.checkInTime,
          checkOutTime: null,
          date: workingScheduleProps.date,
          status: isLate ? 'LATE' : 'STARTED',
          userCode: workingScheduleProps.userCode,
          workingScheduleCode: workingScheduleProps.code,
          createdBy: command.updatedBy,
        }),
      );

      if (timeKeepingResult.isErr()) {
        return Err(timeKeepingResult.unwrapErr());
      }

      return Ok(workingSchedule);
    } else {
      return Err(new ChamCongKhongDuDieuKienError());
    }
  }
}
