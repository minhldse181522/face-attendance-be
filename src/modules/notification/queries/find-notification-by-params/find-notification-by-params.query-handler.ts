import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { NotificationRepositoryPort } from '../../database/notification.repository.port';
import { NotificationEntity } from '../../domain/notification.entity';
import { NotificationNotFoundError } from '../../domain/notification.error';
import { NOTIFICATION_REPOSITORY } from '../../notification.di-tokens';

export class FindNotificationByParamsQuery extends PrismaQueryBase<Prisma.NotificationWhereInput> {}

export type FindNotificationByParamsQueryResult = Result<
  NotificationEntity,
  NotificationNotFoundError
>;

@QueryHandler(FindNotificationByParamsQuery)
export class FindNotificationByParamsQueryHandler {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    protected readonly notificationRepo: NotificationRepositoryPort,
  ) {}

  async execute(
    query: FindNotificationByParamsQuery,
  ): Promise<FindNotificationByParamsQueryResult> {
    const found = await this.notificationRepo.findNotificationByParams(query);
    if (found.isNone()) {
      return Err(new NotificationNotFoundError());
    }
    const notification = found.unwrap();
    return Ok(notification);
  }
}
