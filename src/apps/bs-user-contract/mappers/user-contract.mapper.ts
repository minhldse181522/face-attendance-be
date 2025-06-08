import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import {
  UserContract as UserContractModel,
  Branch as BranchModel,
  UserBranch as UserBranchModel,
  User as UserModel,
  Position as PositionModel,
  Role as RoleModel,
} from '@prisma/client';
import { UserContractResponseDto } from '../dtos/user-contract.response.dto';
import { UserContractEntity } from '../domain/user-contract.entity';
import { UserBranchEntity } from '@src/modules/user-branch/domain/user-branch.entity';
import { BranchEntity } from '@src/modules/branch/domain/branch.entity';
import { PositionEntity } from '@src/modules/position/domain/position.entity';
import { RoleEntity } from '@src/modules/role/domain/role.entity';
import { UserEntity } from '@src/modules/user/domain/user.entity';

type UserContractWithRelations = UserContractModel & {
  userBranches?: Array<
    UserBranchModel & {
      branch?: BranchModel;
    }
  >;
  position?: PositionModel & {
    rolePosition?: RoleModel;
  };
  user?: UserModel | null; // Add user relationship
};

@Injectable()
export class UserContractMapper
  implements
    Mapper<UserContractEntity, UserContractModel, UserContractResponseDto>
{
  toPersistence(entity: UserContractEntity): UserContractModel {
    const copy = entity.getProps();
    const record: UserContractModel = {
      id: copy.id,
      code: copy.code || null,
      title: copy.title || null,
      description: copy.description || null,
      startTime: copy.startTime || null,
      endTime: copy.endTime || null,
      duration: copy.duration || null,
      contractPdf: copy.contractPdf || null,
      status: copy.status || null,
      userCode: copy.userCode || null,
      managedBy: copy.managedBy || null,
      positionCode: copy.positionCode || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: UserContractWithRelations): UserContractEntity {
    // Create the entity with all available properties
    return new UserContractEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        code: record.code,
        title: record.title,
        description: record.description,
        startTime: record.startTime,
        endTime: record.endTime,
        duration: record.duration,
        contractPdf: record.contractPdf,
        status: record.status,
        managedBy: record.managedBy,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
        user: record.user
          ? new UserEntity({
              id: record.user.id,
              createdAt: record.user.createdAt,
              updatedAt: record.user.updatedAt,
              props: {
                code: record.user.code,
                userName: record.user.userName,
                password: record.user.password,
                firstName: record.user.firstName,
                lastName: record.user.lastName,
                email: record.user.email,
                faceImg: record.user.faceImg || null, // Handle null case
                dob: record.user.dob,
                gender: record.user.gender,
                phone: record.user.phone,
                isActive: record.user.isActive,
                roleCode: record.user.roleCode,
                createdBy: record.user.createdBy,
              },
            })
          : undefined,
        userBranch: record.userBranches
          ? record.userBranches.map(
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
        position: record.position
          ? new PositionEntity({
              id: record.position.id,
              props: {
                code: record.position.code,
                positionName: record.position.positionName,
                description: record.position.description,
                baseSalary: record.position.baseSalary,
                rolePosition: record.position.rolePosition
                  ? new RoleEntity({
                      id: record.position.rolePosition.id,
                      props: {
                        roleCode: record.position.rolePosition.roleCode,
                        roleName: record.position.rolePosition.roleName,
                        createdBy: record.position.rolePosition.createdBy,
                      },
                    })
                  : undefined,
                role: record.position.role ?? null,
                createdBy: record.position.createdBy ?? null,
              },
            })
          : undefined,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: UserContractEntity): UserContractResponseDto {
    const props = entity.getProps();
    const response = new UserContractResponseDto(entity);
    const branchName: string[] = [];
    const branchCodes: string[] = []; // Create an array to store branch codes

    entity.getProps().userBranch?.forEach((uc) => {
      const branchProps = uc.getProps();
      if (branchProps.branch && branchProps.branch !== null) {
        branchName.push(branchProps.branch.getProps().branchName);
        // Also collect the branch codes
        if (branchProps.branch.getProps().code) {
          branchCodes.push(branchProps.branch.getProps().code);
        }
      }
    });

    response.code = props.code;
    response.title = props.title;
    response.description = props.description;
    response.startTime = props.startTime;
    response.endTime = props.endTime;
    response.duration = props.duration;
    response.contractPdf = props.contractPdf;
    response.status = props.status;
    response.userCode = props.userCode;
    response.managedBy = props.managedBy;
    response.positionCode = props.positionCode;
    response.branchNames = branchName.length > 0 ? branchName.join(', ') : null;
    response.branchCodes = branchCodes; // Assign the collected branch codes
    // Set fullName property by combining firstName and lastName from user entity if available
    response.fullName = props.user
      ? `${props.user.getProps().firstName || ''} ${props.user.getProps().lastName || ''}`.trim()
      : null;
    response.baseSalary = props.position
      ? props.position.getProps().baseSalary || null
      : null;

    return response;
  }
}
