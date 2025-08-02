import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Form as FormModel } from '@prisma/client';
import { FormResponseDto } from '../dtos/form.response.dto';
import { FormEntity } from '../domain/form.entity';

@Injectable()
export class FormMapper
  implements Mapper<FormEntity, FormModel, FormResponseDto>
{
  toPersistence(entity: FormEntity): FormModel {
    const copy = entity.getProps();
    const record: FormModel = {
      id: copy.id,
      title: copy.title,
      description: copy.description || null,
      roleCode: copy.roleCode,
      status: copy.status,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: FormModel): FormEntity {
    return new FormEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        title: record.title,
        description: record.description,
        roleCode: record.roleCode,
        status: record.status,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: FormEntity): FormResponseDto {
    const props = entity.getProps();
    const response = new FormResponseDto(entity);
    response.title = props.title;
    response.description = props.description || '';
    response.roleCode = props.roleCode;
    response.status = props.status;
    return response;
  }
}
