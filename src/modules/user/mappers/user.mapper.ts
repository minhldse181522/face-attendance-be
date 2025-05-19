import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { UserEntity } from '../domain/user.entity';
import { UserResponseDto } from '../dtos/user.response.dto';

@Injectable()
export class UserMapper
  implements Mapper<UserEntity, UserModel, UserResponseDto>
{
  toPersistence(entity: UserEntity): UserModel {
    const copy = entity.getProps();
    const record: UserModel = {
      id: copy.id,
      // Map entity properties to record
      userName: copy.userName,
      password: copy.password,
      roleCode: copy.roleCode,
      firstName: copy.firstName,
      lastName: copy.lastName,
      email: copy.email,
      bod: copy.bod,
      address: copy.address,
      phone: copy.phone,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: UserModel): UserEntity {
    return new UserEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        userName: record.userName,
        password: record.password,
        roleCode: record.roleCode,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        bod: record.bod,
        address: record.address,
        phone: record.phone,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: UserEntity): UserResponseDto {
    const props = entity.getProps();
    const response = new UserResponseDto(entity);
    // Map entity properties to response DTO
    response.userName = props.userName;
    response.roleCode = props.roleCode;
    response.firstName = props.firstName;
    response.lastName = props.lastName;
    response.email = props.email;
    response.bod = props.bod;
    response.address = props.address;
    response.phone = props.phone;
    return response;
  }
}
