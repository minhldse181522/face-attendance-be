import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Payroll as PayrollModel } from '@prisma/client';
import { PayrollEntity } from '../domain/payroll.entity';
import { PayrollResponseDto } from '../dtos/payroll.response.dto';

@Injectable()
export class PayrollMapper
  implements Mapper<PayrollEntity, PayrollModel, PayrollResponseDto>
{
  toPersistence(entity: PayrollEntity): PayrollModel {
    const copy = entity.getProps();
    const record: PayrollModel = {
      id: copy.id,
      // Map entity properties to record
      code: copy.code,
      userCode: copy.userCode,
      month: copy.month,
      baseSalary: copy.baseSalary,
      deductionFee: copy.deductionFee || null,
      workDay: copy.workDay,
      allowance: copy.allowance,
      overtimeSalary: copy.overtimeSalary,
      lateFine: copy.lateFine,
      lateTimeCount: copy.lateTimeCount || null,
      otherFee: copy.otherFee || null,
      totalSalary: copy.totalSalary,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: PayrollModel): PayrollEntity {
    return new PayrollEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        code: record.code,
        userCode: record.userCode,
        month: record.month,
        baseSalary: record.baseSalary,
        deductionFee: record.deductionFee || null,
        workDay: record.workDay,
        allowance: record.allowance,
        overtimeSalary: record.overtimeSalary,
        lateFine: record.lateFine,
        lateTimeCount: record.lateTimeCount || null,
        otherFee: record.otherFee || null,
        totalSalary: record.totalSalary,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: PayrollEntity): PayrollResponseDto {
    const props = entity.getProps();
    const response = new PayrollResponseDto(entity);
    // Map entity properties to response DTO
    response.code = props.code;
    response.userCode = props.userCode;
    response.month = props.month;
    response.baseSalary = props.baseSalary;
    response.deductionFee = props.deductionFee;
    response.workDay = props.workDay;
    response.allowance = props.allowance;
    response.overtimeSalary = props.overtimeSalary;
    response.lateFine = props.lateFine;
    response.lateTimeCount = props.lateTimeCount;
    response.otherFee = props.otherFee;
    response.totalSalary = props.totalSalary;
    return response;
  }
}
