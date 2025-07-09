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
  LateCheckInError,
} from '../../domain/bang-luong.error';
import {
  FindUserContractByParamsQuery,
  FindUserContractByParamsQueryResult,
} from '../../../../modules/user-contract/queries/find-user-contract-by-params/find-user-contract-by-params.query-handler';
import { ChamCongCommand } from './tinh-bang-luong.command';
import {
  FindTimeKeepingByParamsQuery,
  FindTimeKeepingByParamsQueryResult,
} from '@src/modules/time-keeping/queries/find-time-keeping-by-params/find-time-keeping-by-params.query-handler';
import {
  FindShiftByParamsQuery,
  FindShiftByParamsQueryResult,
} from '@src/modules/shift/queries/find-shift-by-params/find-shift-by-params.query-handler';
import { ShiftNotFoundError } from '@src/modules/shift/domain/shift.error';

export type ChamCongServiceResult = Result<
  WorkingScheduleEntity,
  | WorkingScheduleNotFoundError
  | ChamCongKhongDuDieuKienError
  | CheckInTimeNotInContractError
  | AlreadyCheckInError
  | LateCheckInError
  | ShiftNotFoundError
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
    const code = await this.generateCode.generateCode('TK', 4);

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
    // Kiểm tra checkin ko trễ quá 1 tiếng
    const shiftStartDateTime = new Date(workingDate);
    shiftStartDateTime.setUTCHours(shiftStartTime!.getUTCHours());
    shiftStartDateTime.setUTCMinutes(shiftStartTime!.getUTCMinutes());
    shiftStartDateTime.setUTCSeconds(0);
    shiftStartDateTime.setUTCMilliseconds(0);

    const allowedCheckInDeadline = new Date(
      shiftStartDateTime.getTime() + 60 * 60 * 1000,
    );

    if (new Date(command.checkInTime!) > allowedCheckInDeadline) {
      return Err(new LateCheckInError());
    }

    // Kiếm tra 1 ngày không checkin 2 lần
    const startOfDay = new Date(command.checkInTime!);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(command.checkInTime!);
    endOfDay.setHours(23, 59, 59, 999);
    const alreadyCheckIn: FindTimeKeepingByParamsQueryResult =
      await this.queryBus.execute(
        new FindTimeKeepingByParamsQuery({
          where: {
            checkInTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
      );
    if (!alreadyCheckIn.isErr()) {
      return Err(new AlreadyCheckInError());
    }

    // Kiểm tra thời gian checkin có nằm trong thời hạn hợp đồng
    const checkInTimeValidInContract: FindUserContractByParamsQueryResult =
      await this.queryBus.execute(
        new FindUserContractByParamsQuery({
          where: {
            AND: [
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
      const createdTimeKeeping = await this.commandBus.execute(
        new CreateTimeKeepingCommand({
          code: code,
          checkInTime: command.checkInTime,
          checkOutTime: null,
          date: workingScheduleProps.date,
          status:
            new Date(command.checkInTime) > allowedCheckInDeadline
              ? 'LATE'
              : 'STARTED',
          userCode: workingScheduleProps.userCode,
          workingScheduleCode: workingScheduleProps.code,
          createdBy: command.updatedBy,
        }),
      );
      return Ok(createdTimeKeeping.unwrap());
    } else {
      return Err(new ChamCongKhongDuDieuKienError());
    }
  }
}
