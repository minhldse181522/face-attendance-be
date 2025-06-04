import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import {
  UserContract as UserContractModel,
  Branch,
  UserBranch,
  User as UserModel,
} from '@prisma/client';
import { UserContractResponseDto } from '../dtos/user-contract.response.dto';
import { UserContractEntity } from '../domain/user-contract.entity';

type UserContractWithRelations = UserContractModel & {
  userBranches?: (UserBranch & {
    branch?: Branch | null;
  })[];
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
    // Extract branch information if available
    const branchNames =
      record.userBranches
        ?.map((ub) => ub.branch?.branchName || 'Unknown')
        .join(', ') || '';

    // Extract branch codes
    const branchCodes =
      record.userBranches
        ?.filter((ub) => ub.branchCode)
        .map((ub) => ub.branchCode) || [];

    // Extract user full name from related user record
    let fullName: string | undefined;
    if (record.user) {
      fullName = `${record.user.firstName} ${record.user.lastName}`.trim();
    } else if (record.userCode) {
      fullName = record.userCode; // Fallback to userCode if user object not available
    }

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
        userCode: record.userCode,
        managedBy: record.managedBy,
        positionCode: record.positionCode,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
        // Add branch information from the relationship
        branchNames: branchNames,
        branchCodes: branchCodes,
        fullName: fullName,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: UserContractEntity): UserContractResponseDto {
    const props = entity.getProps();
    const response = new UserContractResponseDto(entity);
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
    response.branchNames = props.branchNames;
    response.branchCodes = props.branchCodes;
    response.fullName = props.fullName;
    return response;
  }
}
