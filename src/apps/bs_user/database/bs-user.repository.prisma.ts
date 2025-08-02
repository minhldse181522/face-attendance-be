import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User as UserModel } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { BsUserMapper } from '../mappers/bs-user.mapper';
import { BsUserRepositoryPort } from './bs-user.repository.port';
import { RoleEnum } from '@src/modules/user/domain/user.type';
import { IField } from '@src/libs/utils';
import { DropDownResponseDto } from '@src/apps/bs_lich_lam_viec/dtos/dropdown.response.dto';
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';

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

  // Tìm user thuộc quyền quản lý
  async findUserByManagement(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput> & {
      userCode?: string;
      quickSearch?: string | number;
    },
  ): Promise<Paginated<DropDownResponseDto>> {
    const client = await this._getClient();
    const { quickSearch, page, limit, offset, orderBy, where = {} } = params;

    const searchableFieldsEmf: IField[] = [
      { field: 'code', type: 'string' },
      { field: 'userName', type: 'string' },
      { field: 'firstName', type: 'string' },
      { field: 'lastName', type: 'string' },
    ];

    let searchConditions: Prisma.UserWhereInput = {} as Prisma.UserWhereInput;

    if (quickSearch) {
      searchConditions = this.createQuickSearchFilter(
        quickSearch,
        searchableFieldsEmf,
      );
    }

    const user = RequestContextService.getRequestUser();
    const role = user?.roleCode;
    const currentUserCode = user?.code;
    const currentUsername = user?.userName;

    let finalWhere: Prisma.UserWhereInput = {
      ...where,
      ...searchConditions,
    };

    // Phân quyền theo role
    if (role === 'R1') {
      // Admin - không lọc
    } else if (role === 'R2') {
      // Nếu là HR, lọc danh sách user được quản lý
      const contracts = await client.userContract.findMany({
        where: {
          managedBy: currentUsername,
          status: 'ACTIVE',
        },
        select: {
          userCode: true,
        },
      });

      const managedUserCodes = contracts
        .map((c) => c.userCode)
        .filter((code): code is string => code !== null);

      if (managedUserCodes.length === 0) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      finalWhere.code = {
        in: managedUserCodes,
      };
    } else if (role === 'R3') {
      // Lấy danh sách user theo chi nhánh của manager
      const currentUser = await client.user.findUnique({
        where: { code: currentUserCode },
        select: { addressCode: true },
      });

      if (!currentUser?.addressCode) {
        throw new Error('Không tìm thấy địa chỉ chi nhánh của người dùng');
      }

      const usersInSameBranch = await client.user.findMany({
        where: {
          addressCode: currentUser.addressCode,
        },
        select: {
          code: true,
        },
      });

      const userCodes = usersInSameBranch.map((u) => u.code);

      finalWhere.code = {
        in: userCodes,
      };
    } else if (role === 'R4') {
      // Staff chỉ xem được của chính mình
      finalWhere.code = currentUserCode;
    }

    const [data, count] = await Promise.all([
      client.user.findMany({
        where: finalWhere,
        skip: offset,
        take: limit,
        orderBy,
        select: {
          userName: true,
          code: true,
          firstName: true,
          lastName: true,
        },
      }),
      client.user.count({
        where: finalWhere,
      }),
    ]);

    const result: DropDownResponseDto[] = data.map((user) => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user.code,
    }));

    return {
      data: result,
      page,
      limit,
      count,
    };
  }

  async findAllUserByManagement(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
    userCode?: string,
    isActive?: boolean,
    position?: string,
    branch?: string,
  ): Promise<Paginated<UserEntity>> {
    const client = await this._getClient();
    const { page, limit, offset, orderBy, where = {} } = params;

    const user = RequestContextService.getRequestUser();
    const role = user?.roleCode;
    const currentUserCode = user?.code;
    const currentUsername = user?.userName;

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

    let finalWhere: Prisma.UserWhereInput = {
      ...where,
      ...branchFilter,
      isActive: typeof isActive === 'string' ? isActive === 'true' : isActive,
    };

    // Phân quyền theo role
    if (role === 'R1') {
      // Admin - không lọc
    } else if (role === 'R2') {
      // Nếu là HR, lọc danh sách user được quản lý
      const contracts = await client.userContract.findMany({
        where: {
          managedBy: currentUsername,
          status: 'ACTIVE',
        },
        select: {
          userCode: true,
        },
      });

      const managedUserCodes = contracts
        .map((c) => c.userCode)
        .filter((code): code is string => code !== null);
      console.log(managedUserCodes);

      if (managedUserCodes.length === 0) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      if (userCode) {
        if (!managedUserCodes.includes(userCode)) {
          return new Paginated({ data: [], count: 0, limit, page });
        }

        finalWhere.code = userCode;
      } else {
        finalWhere.code = {
          in: managedUserCodes,
        };
      }
    } else if (role === 'R3') {
      // Lấy danh sách user theo chi nhánh của manager
      const currentUser = await client.user.findUnique({
        where: { code: currentUserCode },
        select: { addressCode: true },
      });

      if (!currentUser?.addressCode) {
        throw new Error('Không tìm thấy địa chỉ chi nhánh của người dùng');
      }

      const usersInSameBranch = await client.user.findMany({
        where: {
          addressCode: currentUser.addressCode,
        },
        select: {
          code: true,
        },
      });

      const userCodes = usersInSameBranch.map((u) => u.code);

      if (userCode) {
        if (!userCodes.includes(userCode)) {
          return new Paginated({ data: [], count: 0, limit, page });
        }

        finalWhere.code = userCode;
      } else {
        finalWhere.code = {
          in: userCodes,
        };
      }
    } else if (role === 'R4') {
      // Staff chỉ xem được của chính mình
      finalWhere.code = currentUserCode;
    }

    const [data, count] = await Promise.all([
      client.user.findMany({
        where: finalWhere,
        skip: offset,
        take: limit,
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
        where: finalWhere,
      }),
    ]);

    return {
      data: data.map(this.mapper.toDomain),
      page,
      limit,
      count,
    };
  }
}
