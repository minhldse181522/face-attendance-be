import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { NotificationEntity } from '../domain/notification.entity';
import { Option } from 'oxide.ts';

export interface NotificationRepositoryPort
  extends RepositoryPort<NotificationEntity> {
  findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.NotificationWhereInput> & {
      quickSearch?: string | number;
      userCode?: string;
    },
  ): Promise<Paginated<NotificationEntity>>;
  markAllAsReadByUserCode(userCode: string, updatedBy: string): Promise<number>;
  findNotificationByParams(
    params: PrismaQueryBase<Prisma.NotificationWhereInput>,
  ): Promise<Option<NotificationEntity>>;
}
