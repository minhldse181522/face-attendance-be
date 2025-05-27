import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Role as RoleModel } from '@prisma/client';
import { RoleResponseDto } from '../dtos/role.response.dto';
import { RoleEntity } from '../domain/role.entity';

@Injectable()
export class RoleMapper
  implements Mapper<RoleEntity, RoleModel, RoleResponseDto>
{
  toPersistence(entity: RoleEntity): RoleModel {
    const copy = entity.getProps();
    const record: RoleModel = {
      id: copy.id,
      // Map entity properties to record
      roleCode: copy.roleCode,
      roleName: copy.roleName,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: RoleModel): RoleEntity {
    return new RoleEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        roleCode: record.roleCode,
        roleName: record.roleName,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: RoleEntity): RoleResponseDto {
    const props = entity.getProps();
    const response = new RoleResponseDto(entity);
    // Map entity properties to response DTO
    response.roleCode = props.roleCode;
    response.roleName = props.roleName;
    return response;
  }
}
