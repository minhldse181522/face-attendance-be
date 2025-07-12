import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import {
  FormDescription as FormDescriptionModel,
  Form as FormModel,
  User as UserModel,
} from '@prisma/client';
import { FormDescriptionEntity } from '../domain/form-description.entity';
import { FormDescriptionResponseDto } from '../dtos/form-description.response.dto';

@Injectable()
export class FormDescriptionMapper
  implements
    Mapper<
      FormDescriptionEntity,
      FormDescriptionModel,
      FormDescriptionResponseDto
    >
{
  toPersistence(entity: FormDescriptionEntity): FormDescriptionModel {
    const copy = entity.getProps();
    const record: FormDescriptionModel = {
      id: copy.id,
      code: copy.code,
      reason: copy.reason,
      response: copy.response || null,
      status: copy.status,
      file: copy.file || null,
      startTime: copy.startTime,
      endTime: copy.endTime,
      approvedTime: copy.approvedTime || null,
      formId: copy.formId,
      submittedBy: copy.submittedBy,
      approvedBy: copy.approvedBy || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(
    record: FormDescriptionModel & {
      submitter?: UserModel;
      form?: FormModel;
      approver?: UserModel;
    },
  ): FormDescriptionEntity {
    return new FormDescriptionEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        code: record.code,
        reason: record.reason,
        response: record.response,
        status: record.status,
        file: record.file,
        startTime: record.startTime,
        endTime: record.endTime,
        approvedTime: record.approvedTime,
        formId: record.formId,
        submittedBy:
          record.submitter?.firstName && record.submitter?.lastName
            ? `${record.submitter.firstName} ${record.submitter.lastName}`
            : record.submittedBy,
        approvedBy: record.approvedBy,
        formTitle: record.form?.title || '', // Assuming the form model has a title field
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: FormDescriptionEntity): FormDescriptionResponseDto {
    const props = entity.getProps();
    const response = new FormDescriptionResponseDto(entity);
    response.code = props.code;
    response.reason = props.reason;
    response.response = props.response;
    response.status = props.status;
    response.file = props.file || undefined;
    response.startTime = props.startTime;
    response.endTime = props.endTime;
    response.approvedTime = props.approvedTime ?? undefined;
    // response.formId = props.formId;
    response.formTitle = props.formTitle || ''; // Map the formTitle to the response
    response.submittedBy = props.submittedBy;
    response.approvedBy = props.approvedBy ?? undefined;
    return response;
  }
}
