import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Prisma, UserContract as UserContractModel } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { None, Option, Some } from 'oxide.ts';
import { UserContractEntity } from '../domain/user-contract.entity';
import {
  BranchNotFoundError,
  UserContractNotFoundError,
} from '../domain/user-contract.error';
import { UserContractMapper } from '../mappers/user-contract.mapper';
import { UserContractRepositoryPort } from './user-contract.repository.port';

@Injectable()
export class PrismaUserContractRepository
  extends PrismaMultiTenantRepositoryBase<UserContractEntity, UserContractModel>
  implements UserContractRepositoryPort
{
  protected modelName = 'userContract';

  constructor(
    manager: PrismaClientManager, // Sử dụng PrismaClientManager theo yêu cầu của lớp cơ sở
    public mapper: UserContractMapper, // Làm cho mapper công khai
    private readonly generateCode: GenerateCode,
  ) {
    super(manager, mapper);
  }

  async findUserContractByParams(
    params: PrismaQueryBase<Prisma.UserContractWhereInput>,
  ): Promise<Option<UserContractEntity>> {
    const client = await this._getClient();
    const { where = {}, orderBy } = params;
    const result = await client.userContract.findFirst({
      where: { ...where },
      orderBy,
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  async checkExist(userContractCode: string): Promise<boolean> {
    const client = await this._getClient();
    const count = await client.userContract.count({
      where: { code: userContractCode },
    });
    return count > 0;
  }

  async createWithBranches(
    entity: UserContractEntity,
    branchCodes: string[],
    createdBy: string,
  ): Promise<UserContractEntity> {
    const client = await this._getClient();
    const data = this.mapper.toPersistence(entity);

    try {
      const ctCode = await this.generateCode.generateCode('CONTRACT', 4);
      // Sử dụng transaction để đảm bảo tất cả các hoạt động thành công hoặc thất bại cùng nhau
      const result = await client.$transaction(async (tx) => {
        // Đầu tiên tạo hợp đồng người dùng
        const createdContract = await tx.userContract.create({
          data: {
            ...data,
            code: ctCode,
            status: data.status || 'ACTIVE', // Mặc định là trạng thái hoạt động
          },
        });

        // Nếu branchCodes được cung cấp, tạo các mục UserBranch cho từng mã
        if (branchCodes && branchCodes.length > 0) {
          const userBranchPromises = branchCodes.map(async (branchCode) => {
            // Tạo mã duy nhất cho mỗi UserBranch
            const ubCode = await this.generateCode.generateCode('UB', 4);

            return tx.userBranch.create({
              data: {
                code: ubCode,
                branchCode: branchCode,
                userContractCode: createdContract.code,
                createdBy: createdBy,
              },
            });
          });

          // Tạo tất cả các bản ghi UserBranch
          await Promise.all(userBranchPromises);
        }

        // Trả về hợp đồng đã tạo
        return createdContract;
      });

      // Lấy thực thể hợp đồng người dùng hoàn chỉnh với các mối quan hệ mới tạo
      const completeContract = await client.userContract.findUnique({
        where: { id: result.id },
        include: {
          user: true, // Include user information
          userBranches: {
            include: {
              branch: true,
            },
          },
        },
      });

      // Thêm kiểm tra null và xử lý trường hợp đó một cách thích hợp
      if (!completeContract) {
        throw new Error(
          `Không thể truy xuất hợp đồng đã tạo với ID ${result.id}`,
        );
      }

      // Sử dụng ép kiểu rõ ràng hoặc chuyển đổi sang cấu trúc dự kiến
      return this.mapper.toDomain({
        ...completeContract,
        // Thêm bất kỳ trường thiếu nào với giá trị mặc định nếu cần
      });
    } catch (error) {
      // Kiểm tra vi phạm ràng buộc khóa ngoại cụ thể cho chi nhánh
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003' &&
        error.message.includes('dt_user_branch_branch_code_fkey')
      ) {
        throw new BranchNotFoundError(error, { branchCodes });
      }
      // Ném lại các lỗi khác
      throw error;
    }
  }

  async findByUserCode(userCode: string): Promise<UserContractEntity> {
    const client = await this._getClient();
    const contracts = await client.userContract.findMany({
      where: {
        userCode,
        status: 'ACTIVE', // Only fetch contracts with ACTIVE status
      },
      include: {
        user: true, // Include user information
        userBranches: {
          include: {
            branch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1, // Only get the first/latest active contract
    });

    if (contracts.length === 0) {
      throw new UserContractNotFoundError(undefined, { userCode });
    }

    return this.mapper.toDomain(contracts[0]);
  }

  async checkManagedBy(user: string): Promise<boolean> {
    const client = await this._getClient();
    const result = await client.userContract.findFirst({
      where: {
        managedBy: { equals: user },
      },
    });
    if (result) {
      return true;
    } else {
      return false;
    }
  }
}
