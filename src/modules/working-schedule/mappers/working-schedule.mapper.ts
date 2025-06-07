import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { WorkingSchedule as WorkingScheduleModel } from '@prisma/client';
import { WorkingScheduleEntity } from '../domain/working-schedule.entity';
import { WorkingScheduleResponseDto } from '../dtos/working-schedule.response.dto';

@Injectable()
export class WorkingScheduleMapper
  implements
    Mapper<
      WorkingScheduleEntity,
      WorkingScheduleModel,
      WorkingScheduleResponseDto
    >
{
  toPersistence(entity: WorkingScheduleEntity): WorkingScheduleModel {
    const copy = entity.getProps();
    const record: WorkingScheduleModel = {
      id: copy.id,
      code: copy.code || null,
      userCode: copy.userCode || null,
      userContractCode: copy.userContractCode || null,
      date: copy.date || null,
      shiftCode: copy.shiftCode || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: WorkingScheduleModel): WorkingScheduleEntity {
    return new WorkingScheduleEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        code: record.code || null,
        userCode: record.userCode || null,
        userContractCode: record.userContractCode || null,
        date: record.date || null,
        shiftCode: record.shiftCode || null,

        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: WorkingScheduleEntity): WorkingScheduleResponseDto {
    const props = entity.getProps();
    const response = new WorkingScheduleResponseDto(entity);
    response.code = props.code;
    response.userCode = props.userCode;
    response.userContractCode = props.userContractCode;
    response.date = props.date;
    response.shiftCode = props.shiftCode;
    return response;
  }
}
