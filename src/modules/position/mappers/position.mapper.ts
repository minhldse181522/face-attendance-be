import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Position as PositionModel } from '@prisma/client';
import { PositionEntity } from '../domain/position.entity';
import { PositionResponseDto } from '../dtos/position.response.dto';

@Injectable()
export class PositionMapper
  implements Mapper<PositionEntity, PositionModel, PositionResponseDto>
{
  toPersistence(entity: PositionEntity): PositionModel {
    const copy = entity.getProps();
    const record: PositionModel = {
      id: copy.id,
      // Map entity properties to record
      code: copy.code,
      positionName: copy.positionName,
      basicSalary: copy.basicSalary,
      allowance: copy.allowance,
      overtimeSalary: copy.overtimeSalary || null,
      lateFee: copy.lateFee || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: PositionModel): PositionEntity {
    return new PositionEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        code: record.code,
        positionName: record.positionName,
        basicSalary: record.basicSalary,
        allowance: record.allowance,
        overtimeSalary: record.overtimeSalary,
        lateFee: record.lateFee,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: PositionEntity): PositionResponseDto {
    const props = entity.getProps();
    const response = new PositionResponseDto(entity);
    // Map entity properties to response DTO
    response.code = props.code;
    response.positionName = props.positionName;
    response.basicSalary = props.basicSalary;
    response.allowance = props.allowance;
    response.overtimeSalary = props.overtimeSalary;
    response.lateFee = props.lateFee;
    return response;
  }
}
