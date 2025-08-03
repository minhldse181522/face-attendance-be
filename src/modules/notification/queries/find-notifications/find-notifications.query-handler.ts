import { Paginated } from '@libs/ddd';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryWithQuickSearchBase } from '@src/libs/ddd/prisma-query-with-quick-search.base';
import { Ok, Result } from 'oxide.ts';
import { NotificationRepositoryPort } from '../../database/notification.repository.port';
import { NotificationEntity } from '../../domain/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../notification.di-tokens';
import { FindNotificationsRequestDto } from './find-notifications.request.dto';

export class FindNotificationsQuery extends PrismaPaginatedQueryWithQuickSearchBase<Prisma.NotificationWhereInput> {
  quickSearch?: string | number;
  constructor(props: FindNotificationsRequestDto) {
    super(props.findOptions);
    Object.assign(this, props);
  }
}

export type FindNotificationsQueryResult = Result<
  Paginated<NotificationEntity>,
  void
>;

@QueryHandler(FindNotificationsQuery)
export class FindNotificationsQueryHandler
  implements IQueryHandler<FindNotificationsQuery>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    protected readonly notificationRepo: NotificationRepositoryPort,
  ) {}

  async execute(
    query: FindNotificationsQuery,
  ): Promise<FindNotificationsQueryResult> {
    const result =
      await this.notificationRepo.findPaginatedWithQuickSearch(query);

    return Ok(
      new Paginated({
        data: result.data,
        count: result.count,
        limit: query.limit,
        page: query.page,
      }),
    );
  }
}
