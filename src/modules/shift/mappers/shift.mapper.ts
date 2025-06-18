import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import {
  Shift as ShiftModel,
  WorkingSchedule as WorkingScheduleModel,
} from '@prisma/client';
import { ShiftEntity } from '../domain/shift.entity';
import { ShiftResponseDto } from '../dtos/shift.response.dto';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';

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
      lunchBreak: copy.lunchBreak || null,
      workingHours: copy.workingHours || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(
    record: ShiftModel & {
      workingSchedules?: WorkingScheduleModel[];
    },
  ): ShiftEntity {
    return new ShiftEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        code: record.code || null,
        name: record.name || null,
        startTime: record.startTime || null,
        endTime: record.endTime || null,
        lunchBreak: record.lunchBreak || null,
        workingHours: record.workingHours || null,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,

        workingSchedules: record.workingSchedules
          ? record.workingSchedules.map(
              (ws) =>
                new WorkingScheduleEntity({
                  id: ws.id,
                  createdAt: ws.createdAt,
                  updatedAt: ws.updatedAt,
                  props: {
                    code: ws.code,
                    userCode: ws.userCode,
                    userContractCode: ws.userContractCode,
                    date: ws.date,
                    shiftCode: ws.shiftCode,
                    createdBy: ws.createdBy,
                    updatedBy: ws.updatedBy,
                  },
                }),
            )
          : undefined,
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
    response.lunchBreak = props.lunchBreak;
    response.workingHours = props.workingHours;
    return response;
  }
}
