import { UserContractEntity } from './../../../modules/user-contract/domain/user-contract.entity';
import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import {
  User as UserModel,
  Role as RoleModel,
  Branch as BranchModel,
  UserBranch as UserBranchModel,
  UserContract as UserContractModel,
} from '@prisma/client';
import { BranchEntity } from '@src/modules/branch/domain/branch.entity';
import { RoleEntity } from '@src/modules/role/domain/role.entity';
import { UserBranchEntity } from '@src/modules/user-branch/domain/user-branch.entity';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { BsUserResponseDto } from '../dtos/bs-user.response.dto';

@Injectable()
export class BsUserMapper
  implements Mapper<UserEntity, UserModel, BsUserResponseDto>
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

  toDomain(
    record: UserModel & {
      role: RoleModel;
      userContracts: Array<
        UserContractModel & {
          userBranches?: Array<
            UserBranchModel & {
              branch?: BranchModel;
            }
          >;
        }
      >;
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
        isActive: record.isActive,
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
        userContracts: record.userContracts
          ? record.userContracts.map(
              (userContract) =>
                new UserContractEntity({
                  id: userContract.id,
                  createdAt: userContract.createdAt,
                  updatedAt: userContract.updatedAt,
                  props: {
                    userCode: userContract.userCode,
                    status: userContract.status,
                    createdBy: userContract.createdBy,
                    updatedBy: userContract.updatedBy,
                    userBranches: userContract.userBranches
                      ? userContract.userBranches.map(
                          (ub) =>
                            new UserBranchEntity({
                              id: ub.id,
                              createdAt: ub.createdAt,
                              updatedAt: ub.updatedAt,
                              props: {
                                code: ub.code,
                                branchCode: ub.branchCode,
                                userContractCode: ub.userContractCode,
                                createdBy: ub.createdBy,
                                updatedBy: ub.updatedBy,
                                branch: ub.branch
                                  ? new BranchEntity({
                                      id: ub.branch.id,
                                      props: {
                                        code: ub.branch.code,
                                        branchName: ub.branch.branchName,
                                        addressLine: ub.branch.addressLine,
                                        placeId: ub.branch.placeId,
                                        city: ub.branch.city,
                                        district: ub.branch.district,
                                        lat: ub.branch.lat,
                                        long: ub.branch.long,
                                        companyCode: ub.branch.companyCode,
                                        createdBy: ub.branch.createdBy,
                                      },
                                    })
                                  : undefined,
                              },
                            }),
                        )
                      : undefined,
                  },
                }),
            )
          : undefined,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: UserEntity): BsUserResponseDto {
    const props = entity.getProps();
    const response = new BsUserResponseDto(entity);
    const branchName: string[] = [];
    entity.getProps().userContracts?.forEach((uc) => {
      const ucProps = uc.getProps();
      ucProps.userBranches?.forEach((us) => {
        const branchProps = us.getProps();

        if (branchProps.branch && branchProps.branch !== null) {
          branchName.push(branchProps.branch.getProps().branchName);
        }
      });
    });
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
    response.branchName = branchName.length > 0 ? branchName.join(', ') : null;
    return response;
  }
}
