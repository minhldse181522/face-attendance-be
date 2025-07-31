import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { UserContract as UserContractModel } from '@prisma/client';
import { UserContractEntity } from '../domain/user-contract.entity';
import { UserContractResponseDto } from '../dtos/user-contract.response.dto';

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
      endDate: copy.endDate || null,
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

  toDomain(record: UserContractModel): UserContractEntity {
    return new UserContractEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        code: record.code || null,
        title: record.title || null,
        description: record.description || null,
        startTime: record.startTime || null,
        endTime: record.endTime || null,
        duration: record.duration || null,
        contractPdf: record.contractPdf || null,
        status: record.status || null,
        endDate: record.endDate || null,
        userCode: record.userCode || null,
        managedBy: record.managedBy || null,
        positionCode: record.positionCode || null,

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
    response.endDate = props.endDate;
    response.userCode = props.userCode;
    response.managedBy = props.managedBy;
    response.positionCode = props.positionCode;
    return response;
  }
}
