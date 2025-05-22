import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import {
  Branch as BranchModel,
  Position as PositionModel,
  User as UserModel,
} from '@prisma/client';
import { UserEntity } from '../domain/user.entity';
import { UserResponseDto } from '../dtos/user.response.dto';
import { BranchEntity } from '@src/modules/branch/domain/branch.entity';
import { PositionEntity } from '@src/modules/position/domain/position.entity';

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
      faceImg: copy.faceImg || null,
      email: copy.email,
      bod: copy.bod,
      address: copy.address,
      phone: copy.phone,
      contract: copy.contract || null,
      branchCode: copy.branchCode,
      managedBy: copy.managedBy,
      positionCode: copy.positionCode,
      isActive: copy.isActive,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(
    record: UserModel & {
      branch: BranchModel;
      position: PositionModel;
    },
  ): UserEntity {
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
        faceImg: record.faceImg,
        email: record.email,
        bod: record.bod,
        address: record.address,
        phone: record.phone,
        contract: record.contract,
        branchCode: record.branchCode,
        positionCode: record.positionCode,
        managedBy: record.managedBy,
        isActive: record.isActive,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
        branch: record.branch
          ? new BranchEntity({
              id: record.branch.id,
              props: {
                code: record.branch.code,
                branchName: record.branch.branchName,
                createdBy: record.branch.createdBy,
              },
            })
          : undefined,
        position: record.position
          ? new PositionEntity({
              id: record.position.id,
              props: {
                code: record.position.code,
                positionName: record.position.positionName,
                createdBy: record.position.createdBy,
                basicSalary: record.position.basicSalary,
                allowance: record.position.allowance,
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
    response.userName = props.userName;
    response.roleCode = props.roleCode;
    response.firstName = props.firstName;
    response.lastName = props.lastName;
    response.faceImg = props.faceImg;
    response.email = props.email;
    response.bod = props.bod;
    response.address = props.address;
    response.phone = props.phone;
    response.contract = props.contract;
    response.branchCode = props.branchCode;
    response.positionCode = props.positionCode;
    response.managedBy = props.managedBy;
    response.isActive = props.isActive;
    return response;
  }
}
