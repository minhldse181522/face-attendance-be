import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Prisma, User as UserModel } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { UserEntity } from '../domain/user.entity';
import { RoleEnum } from '../domain/user.type';
import { UserMapper } from '../mappers/user.mapper';
import { UserRepositoryPort } from './user.repository.port';
import { DropDownResult } from '@src/libs/utils/dropdown.util';

export const UserScalarFieldEnum = Prisma.UserScalarFieldEnum;
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
    role?: string,
    isActive?: boolean,
  ): Promise<Paginated<UserEntity>> {
    const client = await this._getClient();

    const { limit, offset, page, where = {}, orderBy } = params;

    //filter theo role
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

    // Gộp Điều kiện
    const whereFilter: Prisma.UserWhereInput = {
      ...where,
      ...roleFilter,
      isActive: typeof isActive === 'string' ? isActive === 'true' : isActive,
    };

    const [data, count] = await Promise.all([
      client.user.findMany({
        skip: offset,
        take: limit,
        where: whereFilter,
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

  async findUserDropDown(
    // branchCode?: string,
    roleCode?: string,
  ): Promise<DropDownResult[]> {
    const client = await this._getClient();

    //Nếu là admin + manager load list admin
    //Nêu là HR => load list manager, nếu là STAFF => load list HR
    const roleFilter: Prisma.UserWhereInput = {};
    if (roleCode) {
      switch (roleCode) {
        case RoleEnum.ADMIN:
          roleFilter.roleCode = { equals: 'R1' };
          break;

        case RoleEnum.HR:
          roleFilter.roleCode = { equals: 'R3' };
          break;

        case RoleEnum.MANAGER:
          roleFilter.roleCode = { equals: 'R1' };
          break;

        case RoleEnum.STAFF:
          roleFilter.roleCode = { equals: 'R2' };
          break;
      }
    }

    const result = await client.user.findMany({
      select: {
        userName: true,
        firstName: true,
        lastName: true,
      },
      where: { ...roleFilter },
    });
    return result.map((item) => ({
      label: `${item.firstName} ${item.lastName}`,
      value: item.userName,
    }));
  }
}
