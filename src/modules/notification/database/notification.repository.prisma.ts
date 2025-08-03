import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Notification as NotificationModel, Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { IField } from '@src/libs/utils';
import { NotificationEntity } from '../domain/notification.entity';
import { NotificationMapper } from '../mappers/notification.mapper';
import { NotificationRepositoryPort } from './notification.repository.port';

export const NotificationScalarFieldEnum = Prisma.NotificationScalarFieldEnum;

@Injectable()
export class PrismaNotificationRepository
  extends PrismaMultiTenantRepositoryBase<NotificationEntity, NotificationModel>
  implements NotificationRepositoryPort
{
  protected modelName = 'notification';
  constructor(
    private manager: PrismaClientManager,
    mapper: NotificationMapper,
  ) {
    super(manager, mapper);
  }

  async findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.NotificationWhereInput> & {
      quickSearch?: string | number;
      userCode?: string;
    },
  ): Promise<Paginated<NotificationEntity>> {
    const client = await this._getClient();
    const {
      quickSearch,
      userCode,
      page,
      limit,
      offset,
      orderBy,
      where = {},
    } = params;

    const searchableFieldsEmf: IField[] = [
      { field: 'title', type: 'string' },
      { field: 'message', type: 'string' },
      { field: 'type', type: 'string' },
    ];

    let searchConditions: Prisma.NotificationWhereInput =
      {} as Prisma.NotificationWhereInput;

    if (quickSearch) {
      searchConditions = this.createQuickSearchFilter(
        quickSearch,
        searchableFieldsEmf,
      );
    }

    // Add userCode filter if provided
    const userCodeFilter = userCode ? { userCode } : {};

    const [data, count] = await Promise.all([
      client.notification.findMany({
        skip: offset,
        take: limit,
        where: {
          ...where,
          ...userCodeFilter,
          ...(searchConditions && {
            ...searchConditions,
          }),
        },
        orderBy,
      }),

      client.notification.count({
        where: {
          ...where,
          ...userCodeFilter,
          ...(searchConditions && {
            ...searchConditions,
          }),
        },
      }),
    ]);

    return new Paginated({
      data: count > 0 ? data.map((item) => this.mapper.toDomain(item)) : [],
      count,
      limit,
      page,
    });
  }

  async markAllAsReadByUserCode(
    userCode: string,
    updatedBy: string,
  ): Promise<number> {
    const client = await this._getClient();

    const result = await client.notification.updateMany({
      where: {
        userCode,
        isRead: false,
      },
      data: {
        isRead: true,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    return result.count;
  }
}
