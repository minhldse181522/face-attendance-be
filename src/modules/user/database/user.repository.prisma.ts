import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Prisma, User as UserModel } from '@prisma/client';
import { UserEntity } from '../domain/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserRepositoryPort } from './user.repository.port';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';

@Injectable()
export class PrismaUserRepository
  extends PrismaMultiTenantRepositoryBase<UserEntity, UserModel>
  implements UserRepositoryPort
{
  protected modelName = 'user';

  constructor(
    private manager: PrismaClientManager,
    mapper: UserMapper,
  ) {
    super(manager, mapper);
  }

  async findByUsername(userName: string): Promise<UserEntity | null> {
    const client = await this._getClient();

    const result = await client.user.findFirst({
      where: { userName: userName },
    });

    if (!result) return null;

    return this.mapper.toDomain(result);
  }

  async findAllUser(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
  ): Promise<Paginated<UserEntity>> {
    const client = await this._getClient();

    const { limit, offset, page, where = {}, orderBy } = params;

    const [data, count] = await Promise.all([
      client.user.findMany({
        skip: offset,
        take: limit,
        where: { ...where },
        orderBy,
      }),

      client.user.count({
        where: { ...where },
      }),
    ]);

    return new Paginated({
      data: data.map(this.mapper.toDomain),
      count,
      limit,
      page,
    });
  }
}
