import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { UserContract as UserContractModel } from '@prisma/client';
import { UserContractResponseDto } from '../dtos/user-contract.response.dto';
import { UserContractEntity } from '../domain/user-contract.entity';

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
      userBranchCode: copy.userBranchCode || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: UserContractModel): UserContractEntity {
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
        userBranchCode: record.userBranchCode,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
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
    response.userBranchCode = props.userBranchCode;
    return response;
  }
}
