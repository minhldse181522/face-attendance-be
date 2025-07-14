import { Injectable } from '@nestjs/common';
import { PayrollEntity } from '@src/modules/payroll/domain/payroll.entity';
import { BangLuongResponseDto } from '../dtos/bang-luong.response.dto';

@Injectable()
export class BangLuongMapper {
  toBangLuongResponse(entity: PayrollEntity): BangLuongResponseDto {
    const props = entity.getProps();
    const response = new BangLuongResponseDto(entity);
    response.code = props.code;
    response.userCode = props.userCode;
    response.month = props.month;
    response.baseSalary = props.baseSalary;
    response.actualSalary = props.actualSalary;
    response.deductionFee = props.deductionFee;
    response.workDay = props.workDay;
    response.allowance = props.allowance;
    response.overtimeSalary = props.overtimeSalary;
    response.lateFine = props.lateFine;
    response.otherFee = props.otherFee;
    response.totalWorkHour = props.totalWorkHour;
    response.status = props.status;
    response.paidDate = props.paidDate;
    response.lateTimeCount = props.lateTimeCount;
    response.totalSalary = props.totalSalary;
    return response;
  }
}
