import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { TimeKeeping as TimeKeepingModel } from '@prisma/client';
import { TimeKeepingEntity } from '../domain/time-keeping.entity';
import { TimeKeepingResponseDto } from '../dtos/time-keeping.response.dto';

@Injectable()
export class TimeKeepingMapper
  implements Mapper<TimeKeepingEntity, TimeKeepingModel, TimeKeepingResponseDto>
{
  toPersistence(entity: TimeKeepingEntity): TimeKeepingModel {
    const copy = entity.getProps();
    const record: TimeKeepingModel = {
      id: copy.id,
      code: copy.code || null,
      checkInTime: copy.checkInTime || null,
      checkOutTime: copy.checkOutTime || null,
      date: copy.date || null,
      status: copy.status || null,
      userCode: copy.userCode || null,
      workingScheduleCode: copy.workingScheduleCode || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: TimeKeepingModel): TimeKeepingEntity {
    return new TimeKeepingEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        code: record.code || null,
        checkInTime: record.checkInTime || null,
        checkOutTime: record.checkOutTime || null,
        date: record.date || null,
        status: record.status || null,
        userCode: record.userCode || null,
        workingScheduleCode: record.workingScheduleCode || null,

        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: TimeKeepingEntity): TimeKeepingResponseDto {
    const props = entity.getProps();
    const response = new TimeKeepingResponseDto(entity);
    response.code = props.code;
    response.checkInTime = props.checkInTime;
    response.checkOutTime = props.checkOutTime;
    response.date = props.date;
    response.status = props.status;
    response.userCode = props.userCode;
    response.workingScheduleCode = props.workingScheduleCode;

    return response;
  }
}
