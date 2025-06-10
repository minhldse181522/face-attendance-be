import { Injectable } from '@nestjs/common';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { LichLamViecResponseDto } from '../dtos/lich-lam-viec.response.dto';

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
    response.startShiftTime = props.shift?.getProps().startTime;
    response.endShiftTime = props.shift?.getProps().endTime;
    response.checkInTime = props.timeKeeping?.getProps().checkInTime ?? null;
    response.checkOutTime = props.timeKeeping?.getProps().checkOutTime ?? null;
    return response;
  }
}
