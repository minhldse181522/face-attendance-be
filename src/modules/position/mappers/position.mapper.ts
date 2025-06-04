import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Position as PositionModel, Role as RoleModel } from '@prisma/client';
import { PositionEntity } from '../domain/position.entity';
import { PositionResponseDto } from '../dtos/position.response.dto';
import { RoleEntity } from '@src/modules/role/domain/role.entity';

@Injectable()
export class PositionMapper
  implements Mapper<PositionEntity, PositionModel, PositionResponseDto>
{
  toPersistence(entity: PositionEntity): PositionModel {
    const copy = entity.getProps();
    const record: PositionModel = {
      id: copy.id,
      // Map entity properties to record
      code: copy.code || null,
      positionName: copy.positionName || null,
      role: copy.role,
      description: copy.description || null,
      baseSalary: copy.baseSalary || null,
      allowance: copy.allowance || null,
      overtimeSalary: copy.overtimeSalary || null,
      lateFine: copy.lateFine || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(
    record: PositionModel & {
      rolePosition: RoleModel;
    },
  ): PositionEntity {
    return new PositionEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        code: record.code || null,
        positionName: record.positionName || null,
        role: record.role,
        description: record.description || null,
        baseSalary: record.baseSalary || null,
        allowance: record.allowance || null,
        overtimeSalary: record.overtimeSalary || null,
        lateFine: record.lateFine || null,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
        rolePosition: record.rolePosition
          ? new RoleEntity({
              id: record.rolePosition.id,
              props: {
                roleCode: record.rolePosition.roleCode,
                roleName: record.rolePosition.roleName,
                createdBy: record.rolePosition.createdBy,
              },
            })
          : undefined,
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
    response.role = props.role;
    response.description = props.description;
    response.baseSalary = props.baseSalary;
    response.allowance = props.allowance;
    response.overtimeSalary = props.overtimeSalary;
    response.lateFine = props.lateFine;
    return response;
  }
}
