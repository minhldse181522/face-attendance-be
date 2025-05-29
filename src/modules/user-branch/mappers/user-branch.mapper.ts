import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { UserBranch as UserBranchModel } from '@prisma/client';
import { UserBranchEntity } from '../domain/user-branch.entity';
import { UserBranchResponseDto } from '../dtos/user-branch.response.dto';

@Injectable()
export class UserBranchMapper
  implements Mapper<UserBranchEntity, UserBranchModel, UserBranchResponseDto>
{
  toPersistence(entity: UserBranchEntity): UserBranchModel {
    const copy = entity.getProps();
    const record: UserBranchModel = {
      id: copy.id,
      code: copy.code,
      branchCode: copy.branchCode,
      userContractCode: copy.userContractCode || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: UserBranchModel): UserBranchEntity {
    return new UserBranchEntity({
      id: record.id,
      props: {
        code: record.code,
        branchCode: record.branchCode,
        userContractCode: record.userContractCode,
        createdAt: record.createdAt,
        createdBy: record.createdBy,
        updatedAt: record.updatedAt,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: UserBranchEntity): UserBranchResponseDto {
    const props = entity.getProps();
    const response = new UserBranchResponseDto(entity);

    response.code = props.code;
    response.branchCode = props.branchCode;
    response.userContractCode = props.userContractCode;
    // Standard fields are typically handled by the base class
    // but we could add them here if needed

    return response;
  }
}
