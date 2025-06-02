import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import {
  User as UserModel,
  Role as RoleModel,
  Branch as BranchModel,
  UserContract as UserContractModel,
} from '@prisma/client';
import { UserEntity } from '../domain/user.entity';
import { UserResponseDto } from '../dtos/user.response.dto';
import { RoleEntity } from '@src/modules/role/domain/role.entity';

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
  toDomain(
    record: UserModel & {
      role: RoleModel;
      userContracts?: Array<
        UserContractModel & {
          userBranches?: Array<{
            branch?: BranchModel;
          }>;
        }
      >;
    },
  ): UserEntity {
    // Khởi tạo các biến để lưu thông tin từ hợp đồng
    let branchName = '';
    let managedBy: string | null = null;
    let positionCode: string | null = null;

    // Chỉ xử lý khi có dữ liệu hợp đồng
    if (record.userContracts && record.userContracts.length > 0) {
      // Lấy ra các hợp đồng đang hoạt động (status === 'ACTIVE') từ userCode hiện tại
      const activeContracts = record.userContracts.filter(
        (contract) =>
          contract.status === 'ACTIVE' && contract.userCode === record.code,
      );

      if (activeContracts.length > 0) {
        // Lấy danh sách mã hợp đồng đang hoạt động
        const activeContractCodes = activeContracts
          .filter((contract) => contract.code)
          .map((contract) => contract.code as string);

        console.log(
          `Người dùng ${record.code} có các hợp đồng hoạt động: ${activeContractCodes.join(', ')}`,
        );

        // Danh sách để lưu tên của các chi nhánh
        const branchNames: string[] = [];

        // Duyệt qua từng hợp đồng hoạt động và lấy thông tin chi nhánh
        activeContracts.forEach((contract) => {
          if (contract.userBranches && contract.userBranches.length > 0) {
            contract.userBranches.forEach((userBranch) => {
              if (userBranch.branch && userBranch.branch.branchName) {
                branchNames.push(userBranch.branch.branchName);
              }
            });
          }
        });

        // Ghép các tên chi nhánh lại thành một chuỗi
        branchName = branchNames.join(', ');
        console.log(
          `Người dùng ${record.code} làm việc tại các chi nhánh: ${branchName}`,
        );

        // Lấy thông tin quản lý và vị trí từ hợp đồng mới nhất
        const latestActiveContract = activeContracts[0];
        managedBy = latestActiveContract.managedBy ?? null;
        positionCode = latestActiveContract.positionCode ?? null;
      }
    }

    // Tạo entity với đầy đủ thông tin đã thu thập
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
        managedBy: managedBy,
        isActive: record.isActive,
        positionCode: positionCode,
        roleCode: record.roleCode,
        addressCode: record.addressCode,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
        branchName: branchName, // Gán tên chi nhánh đã được xử lý
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
    response.positionCode = props.positionCode;
    response.managedBy = props.managedBy;
    response.branchName = props.branchName ?? '';
    response.isActive = props.isActive;
    return response;
  }
}
