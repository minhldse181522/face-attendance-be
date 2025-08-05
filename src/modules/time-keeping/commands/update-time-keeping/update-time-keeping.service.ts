import { ConflictException, Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { TimeKeepingRepositoryPort } from '../../database/time-keeping.repository.port';
import { TimeKeepingEntity } from '../../domain/time-keeping.entity';
import {
  CannotCheckOutBecauseNotWorkError,
  NotAllowToCheckout,
  NotAllowToCheckoutAfterMidNight,
  TimeKeepingAlreadyExistsError,
  TimeKeepingAlreadyInUseError,
  TimeKeepingNotFoundError,
} from '../../domain/time-keeping.error';
import { TIME_KEEPING_REPOSITORY } from '../../time-keeping.di-tokens';
import { UpdateTimeKeepingCommand } from './update-time-keeping.command';
import {
  FindShiftByParamsQuery,
  FindShiftByParamsQueryResult,
} from '@src/modules/shift/queries/find-shift-by-params/find-shift-by-params.query-handler';
import {
  FindWorkingScheduleByParamsQuery,
  FindWorkingScheduleByParamsQueryResult,
} from '@src/modules/working-schedule/queries/find-working-schedule-by-params/find-working-schedule-by-params.query-handler';
import { WorkingScheduleNotFoundError } from '@src/modules/working-schedule/domain/working-schedule.error';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';

export type UpdateTimeKeepingServiceResult = Result<
  TimeKeepingEntity,
  | TimeKeepingNotFoundError
  | TimeKeepingAlreadyExistsError
  | TimeKeepingAlreadyInUseError
  | NotAllowToCheckout
  | WorkingScheduleNotFoundError
  | NotAllowToCheckoutAfterMidNight
  | CannotCheckOutBecauseNotWorkError
>;

function parseBreakTimeToMinutes(breakTime: string | null | undefined): number {
  if (!breakTime) return 0;
  const [hoursStr, minutesStr] = breakTime.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  return hours * 60 + minutes;
}

function convertUTCToVNTime(date: Date): Date {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
}

@CommandHandler(UpdateTimeKeepingCommand)
export class UpdateTimeKeepingService
  implements ICommandHandler<UpdateTimeKeepingCommand>
{
  constructor(
    @Inject(TIME_KEEPING_REPOSITORY)
    private readonly timeKeepingRepo: TimeKeepingRepositoryPort,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: UpdateTimeKeepingCommand,
  ): Promise<UpdateTimeKeepingServiceResult> {
    const found = await this.timeKeepingRepo.findOneById(command.timeKeepingId);
    if (found.isNone()) {
      return Err(new TimeKeepingNotFoundError());
    }

    // Đi tìm workingSchedule tương ứng
    const workingSchedule: FindWorkingScheduleByParamsQueryResult =
      await this.queryBus.execute(
        new FindWorkingScheduleByParamsQuery({
          where: {
            code: command.workingScheduleCode,
          },
        }),
      );
    if (workingSchedule.isErr()) {
      return Err(new WorkingScheduleNotFoundError());
    }
    const workingScheduleProps = workingSchedule.unwrap().getProps();

    if (workingScheduleProps.status === 'NOTWORK') {
      return Err(new CannotCheckOutBecauseNotWorkError());
    }

    // Lấy thông tin shift tương ứng
    const shift: FindShiftByParamsQueryResult = await this.queryBus.execute(
      new FindShiftByParamsQuery({
        where: {
          code: workingScheduleProps.shiftCode,
        },
      }),
    );
    // Không cho checkout trước khi hết ca làm - chỉ kiểm tra giờ
    const shiftEndTime = shift.unwrap().getProps().endTime;
    const checkOutTime = new Date(command.checkOutTime!);

    console.log('shiftEndTime', shiftEndTime);
    console.log('checkOutTime', checkOutTime);

    // Chỉ so sánh giờ:phút, không quan tâm đến ngày
    const checkOutHour = checkOutTime.getHours();
    const checkOutMinute = checkOutTime.getMinutes();
    const shiftEndHour = shiftEndTime!.getHours();
    const shiftEndMinute = shiftEndTime!.getMinutes();

    const checkOutTimeInMinutes = checkOutHour * 60 + checkOutMinute;
    const shiftEndTimeInMinutes = shiftEndHour * 60 + shiftEndMinute;

    if (checkOutTimeInMinutes < shiftEndTimeInMinutes) {
      return Err(new NotAllowToCheckout());
    }

    const TimeKeeping = found.unwrap();
    const currentStatus = TimeKeeping.getProps().status;
    let status = currentStatus === 'LATE' ? 'LATE' : 'END';

    const breakTimeStr = shift.unwrap().getProps().lunchBreak;
    const breakTimeInMinutes = parseBreakTimeToMinutes(breakTimeStr);

    const checkinTime = TimeKeeping.getProps().checkInTime!;
    const checkOutDateTime = new Date(command.checkOutTime!);

    console.log('checkinTime', checkinTime);
    console.log('checkOutDateTime', checkOutDateTime);

    const workingHourMs =
      checkOutDateTime.getTime() -
      new Date(checkinTime).getTime() -
      breakTimeInMinutes * 60 * 1000;
    const workingHourNumber = (workingHourMs / (1000 * 60 * 60)).toFixed(2);

    const updatedResult = TimeKeeping.update({
      ...command.getExtendedProps<UpdateTimeKeepingCommand>(),
      status,
      workingHourReal: workingHourNumber,
    });
    await this.commandBus.execute(
      new UpdateWorkingScheduleCommand({
        workingScheduleId: workingScheduleProps.id,
        code: workingScheduleProps.code,
        status: 'END',
        updatedBy: 'system',
      }),
    );
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedTimeKeeping = await this.timeKeepingRepo.update(TimeKeeping);
      return Ok(updatedTimeKeeping);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new TimeKeepingAlreadyExistsError());
      }
      throw error;
    }
  }
}
