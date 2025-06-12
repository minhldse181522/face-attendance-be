import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { FaceReference as FaceReferenceModel } from '@prisma/client';
import { FaceReferenceEntity } from '../domain/reference.entity';
import { FaceReferenceResponseDto } from '../dtos/reference.response.dto';

@Injectable()
export class FaceReferenceMapper
  implements
    Mapper<FaceReferenceEntity, FaceReferenceModel, FaceReferenceResponseDto>
{
  toPersistence(entity: FaceReferenceEntity): FaceReferenceModel {
    const copy = entity.getProps();
    const record: FaceReferenceModel = {
      id: copy.id,
      // Map entity properties to record
      code: copy.code,
      faceImg: copy.faceImg,
      userCode: copy.userCode,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: FaceReferenceModel): FaceReferenceEntity {
    return new FaceReferenceEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        code: record.code,
        faceImg: record.faceImg,
        userCode: record.userCode,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: FaceReferenceEntity): FaceReferenceResponseDto {
    const props = entity.getProps();
    const response = new FaceReferenceResponseDto(entity);
    // Map entity properties to response DTO
    response.code = props.code;
    response.faceImg = props.faceImg;
    response.userCode = props.userCode;
    return response;
  }
}
