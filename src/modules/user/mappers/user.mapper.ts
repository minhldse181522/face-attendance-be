import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { UserEntity } from '../domain/user.entity';
import { UserResponseDto } from '../dtos/user.response.dto';

// Mapper là nơi chuyển đổi qua lại giữa 3 tầng dữ liệu
// Domain Entity ←→ Persistence Model (Prisma)
// Domain Entity ←→ Response DTO (trả về client)

@Injectable()
export class UserMapper
  implements Mapper<UserEntity, UserModel, UserResponseDto>
{
  // Trích xuất dữ liệu từ UserEntity → ánh xạ đúng định dạng UserModel của Prisma schema.
  // Entity → DB model
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
      roleCode: copy.roleCode,
      isActive: copy.isActive,
      addressCode: copy.addressCode || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  // Chuyển từ Prisma record => Domain Entity (để dùng trong logic nghiệp vụ)
  // DB model → Entity
  toDomain(record: UserModel): UserEntity {
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
        isActive: record.isActive,
        roleCode: record.roleCode,
        addressCode: record.addressCode,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  // Trả dữ liệu từ domain entity sang DTO phù hợp để trả về API
  // Entity → DTO (client view)
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
    response.isActive = props.isActive;
    return response;
  }
}
