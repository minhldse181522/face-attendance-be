import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Shift as ShiftModel } from '@prisma/client';
import { ShiftEntity } from '../domain/shift.entity';
import { ShiftResponseDto } from '../dtos/shift.response.dto';

@Injectable()
export class ShiftMapper
  implements Mapper<ShiftEntity, ShiftModel, ShiftResponseDto>
{
  toPersistence(entity: ShiftEntity): ShiftModel {
    const copy = entity.getProps();
    const record: ShiftModel = {
      id: copy.id,
      code: copy.code || null,
      name: copy.name || null,
      startTime: copy.startTime || null,
      endTime: copy.endTime || null,
      workingHours: copy.workingHours || null,
      delayTime: copy.delayTime || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: ShiftModel): ShiftEntity {
    return new ShiftEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        code: record.code || null,
        name: record.name || null,
        startTime: record.startTime || null,
        endTime: record.endTime || null,
        workingHours: record.workingHours || null,
        delayTime: record.delayTime || null,

        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: ShiftEntity): ShiftResponseDto {
    const props = entity.getProps();
    const response = new ShiftResponseDto(entity);
    response.code = props.code;
    response.name = props.name;
    response.startTime = props.startTime;
    response.endTime = props.endTime;
    response.workingHours = props.workingHours;
    response.delayTime = props.delayTime;
    return response;
  }
}
