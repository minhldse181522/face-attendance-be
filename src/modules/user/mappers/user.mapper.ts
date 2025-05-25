import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { User as UserModel, Role as RoleModel } from '@prisma/client';
import { UserEntity } from '../domain/user.entity';
import { UserResponseDto } from '../dtos/user.response.dto';
import { RoleEntity } from '@src/modules/role/domain/role.entity';

@Injectable()
export class UserMapper
  implements Mapper<UserEntity, UserModel, UserResponseDto>
{
  toPersistence(entity: UserEntity): UserModel {
    const copy = entity.getProps();
    const record: UserModel = {
      id: copy.id,
      // Map entity properties to record
      code: copy.code,
      userName: copy.userName,
      password: copy.password,
      firstName: copy.firstName,
      lastName: copy.lastName,
      email: copy.email,
      faceImg: copy.faceImg || null,
      dob: copy.dob,
      gender: copy.gender,
      phone: copy.phone,
      typeOfWork: copy.typeOfWork || null,
      managedBy: copy.managedBy,
      roleCode: copy.roleCode,
      isActive: copy.isActive,
      addressCode: copy.addressCode,
      positionCode: copy.positionCode,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(
    record: UserModel & {
      role: RoleModel;
    },
  ): UserEntity {
    return new UserEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        code: record.code,
        userName: record.userName,
        password: record.password,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        faceImg: record.faceImg,
        dob: record.dob,
        gender: record.gender,
        phone: record.phone,
        typeOfWork: record.typeOfWork,
        managedBy: record.managedBy,
        isActive: record.isActive,
        positionCode: record.positionCode,
        roleCode: record.roleCode,
        addressCode: record.addressCode,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
        role: record.role
          ? new RoleEntity({
              id: record.role.id,
              props: {
                roleCode: record.role.roleCode,
                roleName: record.role.roleName,
                createdBy: record.role.createdBy,
              },
            })
          : undefined,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: UserEntity): UserResponseDto {
    const props = entity.getProps();
    const response = new UserResponseDto(entity);
    // Map entity properties to response DTO
    response.code = props.code;
    response.userName = props.userName;
    response.firstName = props.firstName;
    response.lastName = props.lastName;
    response.email = props.email;
    response.faceImg = props.faceImg;
    response.dob = props.dob;
    response.gender = props.gender;
    response.phone = props.phone;
    response.typeOfWork = props.typeOfWork;
    response.roleCode = props.roleCode;
    response.addressCode = props.addressCode;
    response.positionCode = props.positionCode;
    response.managedBy = props.managedBy;
    response.isActive = props.isActive;
    return response;
  }
}
