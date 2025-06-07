import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Prisma, User as UserModel } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { BsUserMapper } from '../mappers/bs-user.mapper';
import { BsUserRepositoryPort } from './bs-user.repository.port';

@Injectable()
export class PrismaBsUserRepository
  extends PrismaMultiTenantRepositoryBase<UserEntity, UserModel>
  implements BsUserRepositoryPort
{
  protected modelName = 'user';

  constructor(
    private manager: PrismaClientManager,
    mapper: BsUserMapper,
  ) {
    super(manager, mapper);
  }

  async findUserWithActiveContract(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
  ) {
    const client = await this._getClient();
    const { limit, offset, page, where = {}, orderBy } = params;

    const [data, count] = await Promise.all([
      client.user.findMany({
        skip: offset,
        take: limit,
        where: {
          ...where,
        },
        include: {
          userContracts: {
            where: { status: 'ACTIVE' },
            include: {
              userBranches: {
                include: {
                  branch: true,
                },
              },
            },
          },
        },
        orderBy,
      }),

      client.user.count({
        where: {
          ...where,
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
}
