import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Prisma, User as UserModel } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { BsUserMapper } from '../mappers/bs-user.mapper';
import { BsUserRepositoryPort } from './bs-user.repository.port';
import { RoleEnum } from '@src/modules/user/domain/user.type';

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

  async findFullUserInforByParam(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
    role?: string,
    isActive?: boolean,
    position?: string,
    branch?: string,
  ): Promise<Paginated<UserEntity>> {
    const client = await this._getClient();
    const { limit, offset, page, where = {}, orderBy } = params;

    const roleFilter: Prisma.UserWhereInput = {};
    if (role) {
      switch (role) {
        case RoleEnum.ADMIN:
          roleFilter.roleCode = { equals: 'R1' };
          break;

        case RoleEnum.HR:
          roleFilter.roleCode = { equals: 'R2' };
          break;

        case RoleEnum.MANAGER:
          roleFilter.roleCode = { equals: 'R3' };
          break;

        case RoleEnum.STAFF:
          roleFilter.roleCode = { equals: 'R4' };
          break;
      }
    }

    const branchFilter: Prisma.UserWhereInput = branch
      ? {
          userContracts: {
            some: {
              status: 'ACTIVE',
              userBranches: {
                some: {
                  branch: {
                    code: { equals: branch },
                  },
                },
              },
            },
          },
        }
      : {};

    // Gộp Điều kiện
    const whereFilter: Prisma.UserWhereInput = {
      ...where,
      ...roleFilter,
      ...branchFilter,
      isActive: typeof isActive === 'string' ? isActive === 'true' : isActive,
    };

    const [data, count] = await Promise.all([
      client.user.findMany({
        skip: offset,
        take: limit,
        where: whereFilter,
        orderBy,
        include: {
          role: {
            include: {
              positions: {
                where: {
                  code: position,
                },
              },
            },
          },
          userContracts: {
            where: {
              status: 'ACTIVE',
            },
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              userBranches: {
                include: {
                  branch: true,
                },
              },
            },
          },
        },
      }),

      client.user.count({
        where: whereFilter,
      }),
    ]);

    return new Paginated({
      data: data.map(this.mapper.toDomain),
      count,
      limit,
      page,
    });
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
