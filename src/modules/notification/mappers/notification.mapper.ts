import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Notification as NotificationModel } from '@prisma/client';
import { NotificationEntity } from '../domain/notification.entity';
import { NotificationResponseDto } from '../dtos/notification.response.dto';

@Injectable()
export class NotificationMapper
  implements
    Mapper<NotificationEntity, NotificationModel, NotificationResponseDto>
{
  toPersistence(entity: NotificationEntity): NotificationModel {
    const copy = entity.getProps();
    const record: NotificationModel = {
      id: copy.id,
      // Map entity properties to record
      title: copy.title,
      message: copy.message,
      type: copy.type,
      isRead: copy.isRead,
      userCode: copy.userCode || '',
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: NotificationModel): NotificationEntity {
    return new NotificationEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        title: record.title,
        message: record.message,
        type: record.type,
        isRead: record.isRead,
        userCode: record.userCode,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: NotificationEntity): NotificationResponseDto {
    const props = entity.getProps();
    const response = new NotificationResponseDto(entity);
    // Map entity properties to response DTO
    response.title = props.title;
    response.message = props.message;
    response.type = props.type;
    response.isRead = props.isRead;
    response.userCode = props.userCode;
    return response;
  }
}
