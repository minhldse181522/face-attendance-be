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
      const currentUserContract = await client.userContract.findFirst({
        where: {
          userCode: currentUserCode,
          status: 'ACTIVE',
        },
        include: {
          userBranches: true,
        },
      });

      if (!currentUserContract || !currentUserContract.userBranches.length) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      // Lấy branch codes từ user contract của manager
      const managerBranchCodes = currentUserContract.userBranches.map(
        (ub) => ub.branchCode,
      );

      // Tìm tất cả user contracts thuộc cùng branch
      const contractsInSameBranch = await client.userContract.findMany({
        where: {
          status: 'ACTIVE',
          userBranches: {
            some: {
              branchCode: {
                in: managerBranchCodes,
              },
            },
          },
        },
        select: {
          userCode: true,
        },
      });

      const userCodes = contractsInSameBranch
        .map((c) => c.userCode)
        .filter((code): code is string => code !== null);

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

    // Nếu có userCode, ưu tiên lấy user theo userCode
    if (userCode) {
      const userData = await client.user.findUnique({
        where: { code: userCode },
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
      });

      if (!userData) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      // Kiểm tra isActive nếu có
      if (typeof isActive !== 'undefined' && userData.isActive !== isActive) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      return new Paginated({
        data: [this.mapper.toDomain(userData)],
        count: 1,
        limit,
        page,
      });
    }

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

      // Kiểm tra từng user được quản lý xem có contract không
      const usersWithoutContract: string[] = [];
      for (const code of managedUserCodes) {
        const existingContract = await client.userContract.findFirst({
          where: { userCode: code },
        });
        if (!existingContract) {
          usersWithoutContract.push(code);
        }
      }

      // Kết hợp user được quản lý và user chưa có contract
      const finalUserCodes = [
        ...new Set([...managedUserCodes, ...usersWithoutContract]),
      ];

      if (finalUserCodes.length === 0) {
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
      const currentUserContract = await client.userContract.findFirst({
        where: {
          userCode: currentUserCode,
          status: 'ACTIVE',
        },
        include: {
          userBranches: true,
        },
      });

      if (!currentUserContract || !currentUserContract.userBranches.length) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      // Lấy branch codes từ user contract của manager
      const managerBranchCodes = currentUserContract.userBranches.map(
        (ub) => ub.branchCode,
      );

      // Tìm tất cả user contracts thuộc cùng branch
      const contractsInSameBranch = await client.userContract.findMany({
        where: {
          status: 'ACTIVE',
          userBranches: {
            some: {
              branchCode: {
                in: managerBranchCodes,
              },
            },
          },
        },
        select: {
          userCode: true,
        },
      });

      const userCodes = contractsInSameBranch
        .map((c) => c.userCode)
        .filter((code): code is string => code !== null);

      finalWhere.code = {
        in: userCodes,
      };
    } else if (role === 'R4') {
      // Staff chỉ xem được của chính mình
      finalWhere.code = currentUserCode;
    }

    // Lọc theo position nếu có
    if (position) {
      const userContractsWithPosition = await client.userContract.findMany({
        where: {
          status: 'ACTIVE',
          positionCode: position,
        },
        select: {
          userCode: true,
        },
      });

      const userCodesWithPosition = userContractsWithPosition
        .map((c) => c.userCode)
        .filter((code): code is string => code !== null);

      if (userCodesWithPosition.length === 0) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      // Kết hợp với điều kiện code hiện tại
      if (finalWhere.code) {
        if (typeof finalWhere.code === 'string') {
          // Nếu là string đơn, kiểm tra xem có trong danh sách position không
          if (!userCodesWithPosition.includes(finalWhere.code)) {
            return new Paginated({ data: [], count: 0, limit, page });
          }
        } else if (finalWhere.code.in && Array.isArray(finalWhere.code.in)) {
          // Nếu là array, lấy giao của 2 mảng
          const intersection = finalWhere.code.in.filter((code: string) =>
            userCodesWithPosition.includes(code),
          );
          if (intersection.length === 0) {
            return new Paginated({ data: [], count: 0, limit, page });
          }
          finalWhere.code = { in: intersection };
        } else {
          // Nếu không phải array hoặc string, chỉ dùng position filter
          finalWhere.code = { in: userCodesWithPosition };
        }
      } else {
        finalWhere.code = { in: userCodesWithPosition };
      }
    }

    // Lọc theo branch nếu có
    if (branch) {
      const userContractsWithBranch = await client.userContract.findMany({
        where: {
          status: 'ACTIVE',
          userBranches: {
            some: {
              branch: {
                code: branch,
              },
            },
          },
        },
        select: {
          userCode: true,
        },
      });

      const userCodesWithBranch = userContractsWithBranch
        .map((c) => c.userCode)
        .filter((code): code is string => code !== null);

      if (userCodesWithBranch.length === 0) {
        return new Paginated({
          data: [],
          count: 0,
          limit,
          page,
        });
      }

      // Kết hợp với điều kiện code hiện tại
      if (finalWhere.code) {
        if (typeof finalWhere.code === 'string') {
          // Nếu là string đơn, kiểm tra xem có trong danh sách branch không
          if (!userCodesWithBranch.includes(finalWhere.code)) {
            return new Paginated({ data: [], count: 0, limit, page });
          }
        } else if (finalWhere.code.in && Array.isArray(finalWhere.code.in)) {
          // Nếu là array, lấy giao của 2 mảng
          const intersection = finalWhere.code.in.filter((code: string) =>
            userCodesWithBranch.includes(code),
          );
          if (intersection.length === 0) {
            return new Paginated({ data: [], count: 0, limit, page });
          }
          finalWhere.code = { in: intersection };
        } else {
          // Nếu không phải array hoặc string, chỉ dùng branch filter
          finalWhere.code = { in: userCodesWithBranch };
        }
      } else {
        finalWhere.code = { in: userCodesWithBranch };
      }
    }

    // Lấy danh sách user chưa có contract cho R2 và R3
    let usersWithoutContract: string[] = [];
    if (role === 'R2' || role === 'R3') {
      let allowedUserCodes: string[] = [];

      if (role === 'R2') {
        // HR chỉ lấy user có role STAFF (R4) và chưa có contract
        const staffUsers = await client.user.findMany({
          where: {
            roleCode: 'R4', // Chỉ lấy user có role STAFF
          },
          select: {
            code: true,
          },
        });
        allowedUserCodes = staffUsers.map((u) => u.code);
      } else if (role === 'R3') {
        // Manager chỉ lấy user có role HR (R2) hoặc STAFF (R4) trong cùng chi nhánh
        const currentUserContract = await client.userContract.findFirst({
          where: {
            userCode: currentUserCode,
            status: 'ACTIVE',
          },
          include: {
            userBranches: true,
          },
        });

        if (currentUserContract?.userBranches.length) {
          const managerBranchCodes = currentUserContract.userBranches.map(
            (ub) => ub.branchCode,
          );

          // Tìm tất cả user contracts thuộc cùng branch
          const contractsInSameBranch = await client.userContract.findMany({
            where: {
              status: 'ACTIVE',
              userBranches: {
                some: {
                  branchCode: {
                    in: managerBranchCodes,
                  },
                },
              },
            },
            include: {
              user: {
                select: {
                  code: true,
                  roleCode: true,
                },
              },
            },
          });

          const usersInSameBranch = contractsInSameBranch
            .filter((c) => c.user && ['R2', 'R4'].includes(c.user.roleCode))
            .map((c) => c.user!.code);

          allowedUserCodes = usersInSameBranch;
        }
      }

      // Lấy tất cả userCode đã tồn tại trong userContract
      const existingUserCodes = await client.userContract.findMany({
        select: {
          userCode: true,
        },
      });

      const existingCodes = existingUserCodes
        .map((contract) => contract.userCode)
        .filter((code): code is string => code !== null);

      // Tìm user thuộc quyền quản lý nhưng chưa có trong userContract
      usersWithoutContract = allowedUserCodes.filter(
        (userCode) => !existingCodes.includes(userCode),
      );
    }

    // Kết hợp user đã có trong kết quả filter với user chưa có contract
    if (usersWithoutContract.length > 0) {
      let currentUserCodes: string[] = [];

      if (finalWhere.code) {
        if (typeof finalWhere.code === 'string') {
          currentUserCodes = [finalWhere.code];
        } else if (finalWhere.code.in && Array.isArray(finalWhere.code.in)) {
          currentUserCodes = finalWhere.code.in;
        }
      }

      // Cộng user chưa có contract vào danh sách kết quả
      const combinedUserCodes = [
        ...new Set([...currentUserCodes, ...usersWithoutContract]),
      ];
      finalWhere.code = { in: combinedUserCodes };
    }

    // Lấy danh sách user theo điều kiện đã lọc
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
