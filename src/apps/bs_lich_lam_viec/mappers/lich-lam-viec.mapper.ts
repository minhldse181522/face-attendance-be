import { Injectable } from '@nestjs/common';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { LichLamViecResponseDto } from '../dtos/lich-lam-viec.response.dto';
import dayjs from 'dayjs';

@Injectable()
export class LichLamViecMapper {
  toLichLamViecResponse(entity: WorkingScheduleEntity): LichLamViecResponseDto {
    const props = entity.getProps();
    const response = new LichLamViecResponseDto(entity);
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
    response.startShiftTime = dayjs(props.shift?.getProps().startTime).format(
      'HH:mm',
    );
    response.endShiftTime = dayjs(props.shift?.getProps().endTime).format(
      'HH:mm',
    );
    response.workingHours = props.shift?.getProps().workingHours
      ? props.shift?.getProps().workingHours
      : props.status;
    response.checkInTime = props.timeKeeping?.getProps().checkInTime ?? null;
    response.checkOutTime = props.timeKeeping?.getProps().checkOutTime ?? null;
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
}
