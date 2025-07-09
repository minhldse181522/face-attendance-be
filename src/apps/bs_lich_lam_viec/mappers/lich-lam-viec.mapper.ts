import { Injectable } from '@nestjs/common';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { LichLamViecResponseDto } from '../dtos/lich-lam-viec.response.dto';
import dayjs from '@libs/utils/dayjs';
import { TimeKeepingEntity } from '@src/modules/time-keeping/domain/time-keeping.entity';
import { LichChamCongResponseDto } from '../dtos/lich-cham-cong.response.dto';

@Injectable()
export class LichLamViecMapper {
  toLichLamViecResponse(entity: WorkingScheduleEntity): LichLamViecResponseDto {
    const props = entity.getProps();
    const response = new LichLamViecResponseDto(entity);
    response.timeKeepingId = props.timeKeeping?.id.toString() ?? null;
    response.code = props.code;
    response.userCode = props.userCode;
    response.userContractCode = props.userContractCode;
    response.status = props.status;
    response.date = props.date;
    response.fullName =
      props.user?.getProps().firstName + ' ' + props.user?.getProps().lastName;
    response.shiftCode = props.shiftCode;
    response.shiftName = props.shift?.getProps().name;
    response.branchName = props.branch?.getProps().branchName;
    response.branchCode = props.branch?.getProps().code;
    response.addressLine = props.branch?.getProps().addressLine;
    const shiftStartTime = props.shift?.getProps().startTime;
    const shiftEndTime = props.shift?.getProps().endTime;
    response.startShiftTime = shiftStartTime
      ? dayjs
          .tz(
            `1970-01-01T${dayjs(shiftStartTime).utc().format('HH:mm')}:00`,
            'Asia/Ho_Chi_Minh',
          )
          .format('HH:mm')
      : null;

    response.endShiftTime = shiftEndTime
      ? dayjs
          .tz(
            `1970-01-01T${dayjs(shiftEndTime).utc().format('HH:mm')}:00`,
            'Asia/Ho_Chi_Minh',
          )
          .format('HH:mm')
      : null;
    response.workingHours = props.shift?.getProps().workingHours
      ? props.shift?.getProps().workingHours
      : props.status;
    response.checkInTime = props.timeKeeping?.getProps().checkInTime ?? null;
    response.checkOutTime = props.timeKeeping?.getProps().checkOutTime ?? null;
    response.workingHourReal =
      props.timeKeeping?.getProps().workingHourReal ?? null;
    response.statusTimeKeeping = props.timeKeeping?.getProps().status ?? null;
    response.positionName = props.userContract
      ?.getProps()
      .position?.getProps().positionName;
    response.managerFullName =
      props.userContract?.getProps().manager?.getProps().firstName +
      ' ' +
      props.userContract?.getProps().manager?.getProps().lastName;
    return response;
  }

  toLichChamCongResponse(entity: TimeKeepingEntity): LichChamCongResponseDto {
    const props = entity.getProps();
    const response = new LichChamCongResponseDto(entity);
    response.code = props.code;
    response.checkInTime = props.checkInTime;
    response.checkOutTime = props.checkOutTime;
    response.date = props.date;
    response.status = props.status;
    response.userCode = props.userCode;
    response.workingScheduleCode = props.workingScheduleCode;

    if (props.checkInTime && props.checkOutTime) {
      const millis = props.checkOutTime.getTime() - props.checkInTime.getTime();
      response.workingHourReal = (millis / (1000 * 60 * 60)).toFixed(2); // làm tròn 2 chữ số sau dấu thập phân
    } else {
      response.workingHourReal = null;
    }

    return response;
  }
}
