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
      userCode: string;
      quickSearch?: string | number;
    },
  ): Promise<Paginated<DropDownResponseDto>> {
    const client = await this._getClient();
    const {
      userCode,
      quickSearch,
      page,
      limit,
      offset,
      orderBy,
      where = {},
    } = params;

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

    // Lấy thông tin user để biết được role + usercode
    const currentUser = await client.user.findUnique({
      where: { code: userCode },
      select: {
        code: true,
        roleCode: true,
        userName: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException(`Không tìm thấy user với code: ${userCode}`);
    }

    let finalWhere: Prisma.UserWhereInput = {
      ...where,
      ...searchConditions,
    };

    // Phân quyền theo role
    // HR: lấy danh sách quản lý bởi user này trong Hợp đồng
    if (currentUser.roleCode === 'R2') {
      const contracts = await client.userContract.findMany({
        where: {
          managedBy: currentUser.userName,
        },
        select: {
          userCode: true,
        },
      });

      const userCodes = contracts.map((c) => c.userCode).filter(Boolean);

      finalWhere.code = {
        in: userCodes as string[],
      };
      // Nếu là manager thì load chi nhánh của nó
    } else if (currentUser.roleCode === 'R3') {
      // Lấy các branchCode của manager hiện tại
      const managerContracts = await client.userContract.findMany({
        where: {
          userCode: currentUser.code,
        },
        select: {
          code: true,
          userBranches: {
            select: {
              branchCode: true,
            },
          },
        },
      });

      const managerBranchCodes = managerContracts
        .flatMap((c) => c.userBranches.map((ub) => ub.branchCode))
        .filter((code): code is string => !!code);

      if (managerBranchCodes.length === 0) {
        // Không có chi nhánh nào, trả về rỗng
        return {
          data: [],
          page,
          limit,
          count: 0,
        };
      }

      // Tìm các userCode thuộc các chi nhánh đó
      const relatedUserContracts = await client.userContract.findMany({
        where: {
          userBranches: {
            some: {
              branchCode: { in: managerBranchCodes },
            },
          },
        },
        select: {
          userCode: true,
        },
      });

      const relatedUserCodes = relatedUserContracts
        .map((uc) => uc.userCode)
        .filter((code): code is string => !!code);

      finalWhere.code = {
        in: relatedUserCodes,
      };
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
}

// Nhận vào userCode ==> sao đó kiểm tra các tài khoản thuộc quyền hạng của nó
//  nếu HR thì những tk thuộc managerBy của nó , nếu R3 thì chi nhánh của nó , nếu R1 thì full
