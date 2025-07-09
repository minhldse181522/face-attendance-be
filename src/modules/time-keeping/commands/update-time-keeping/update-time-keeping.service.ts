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
>;

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

    // Lấy thông tin shift tương ứng
    const shift: FindShiftByParamsQueryResult = await this.queryBus.execute(
      new FindShiftByParamsQuery({
        where: {
          code: workingScheduleProps.shiftCode,
        },
      }),
    );
    // Không cho checkout trước khi hết ca làm
    const shiftEndTime = shift.unwrap().getProps().endTime;
    const shiftDate = workingScheduleProps.date;
    const allowCheckOutTime = new Date(shiftDate!);
    allowCheckOutTime.setUTCHours(shiftEndTime!.getUTCHours());
    allowCheckOutTime.setUTCMinutes(shiftEndTime!.getUTCMinutes());
    allowCheckOutTime.setUTCSeconds(0);
    allowCheckOutTime.setUTCMilliseconds(0);

    const checkOutTime = new Date(command.checkOutTime!);

    if (checkOutTime < allowCheckOutTime) {
      return Err(new NotAllowToCheckout());
    }

    // không được checkout sau 12h đêm
    const midnight = new Date(shiftDate!);
    midnight.setUTCDate(midnight.getUTCDate() + 1);
    midnight.setUTCHours(0, 0, 0, 0);
    if (checkOutTime >= midnight) {
      return Err(new NotAllowToCheckoutAfterMidNight());
    }

    // Kiểm tra giờ checkin
    const shiftStartTime = shift.unwrap().getProps().startTime;
    const workingDate = new Date(workingScheduleProps.date!);

    const shiftStartDateTime = new Date(workingDate);
    shiftStartDateTime.setUTCHours(shiftStartTime!.getUTCHours());
    shiftStartDateTime.setUTCMinutes(shiftStartTime!.getUTCMinutes());
    shiftStartDateTime.setUTCSeconds(0);
    shiftStartDateTime.setUTCMilliseconds(0);

    const TimeKeeping = found.unwrap();
    // Kiểm tra giờ checkin để chốt status
    let status = 'END';
    const checkInTime = TimeKeeping.getProps().checkInTime;
    if (checkInTime) {
      const lateThreshold = new Date(
        shiftStartDateTime.getTime() + 60 * 60 * 1000,
      );
      if (checkInTime > lateThreshold) {
        status = 'LATE';
      }
    }

    const workingHourMs = checkOutTime.getTime() - shiftStartDateTime.getTime();
    const workingHourNumber = (workingHourMs / (1000 * 60 * 60)).toFixed(2);

    const updatedResult = TimeKeeping.update({
      ...command.getExtendedProps<UpdateTimeKeepingCommand>(),
      status,
      workingHourReal: workingHourNumber,
    });
    await this.commandBus.execute(
      new UpdateWorkingScheduleCommand({
        workingScheduleId: workingScheduleProps.id,
        status: 'END',
        updatedBy: command.updatedBy,
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
