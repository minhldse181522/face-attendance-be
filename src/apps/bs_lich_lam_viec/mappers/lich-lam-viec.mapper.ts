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
    response.date = props.date;
    response.shiftCode = props.shiftCode;
    response.fullName =
      props.user?.getProps().firstName + ' ' + props.user?.getProps().lastName;
    response.shiftName = props.shift?.getProps().name;
    response.contractStartTime = props.userContract?.getProps().startTime;
    response.contractEndTime = props.userContract?.getProps().endTime;
    return response;
  }
}
