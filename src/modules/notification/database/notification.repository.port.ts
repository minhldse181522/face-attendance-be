import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { NotificationEntity } from '../domain/notification.entity';

export interface NotificationRepositoryPort
  extends RepositoryPort<NotificationEntity> {
  findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.NotificationWhereInput> & {
      quickSearch?: string | number;
    },
  ): Promise<Paginated<NotificationEntity>>;
}
