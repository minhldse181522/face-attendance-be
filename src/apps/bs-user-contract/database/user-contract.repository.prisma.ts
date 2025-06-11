import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserContract as UserContractModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
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

  async checkExist(userContractCode: string): Promise<boolean> {
    const client = await this._getClient();
    const count = await client.userContract.count({
      where: { code: userContractCode },
    });
    return count > 0;
  }

  // Helper method to transform Prisma response to match expected type structure
  private transformPrismaResponse(contract: any): any {
    return {
      ...contract,
      user: contract.user || undefined,
      position: contract.position || undefined,
      userBranches:
        contract.userBranches?.map((ub) => ({
          ...ub,
          branch: ub.branch || undefined,
        })) || undefined,
    };
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
        const { id, ...dataWithoutId } = data;

        // Đầu tiên tạo hợp đồng người dùng
        const createdContract = await tx.userContract.create({
          data: {
            ...dataWithoutId,
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

      // Transform the response to match expected types
      const transformedContract =
        this.transformPrismaResponse(completeContract);

      // Return the domain entity
      return this.mapper.toDomain(transformedContract);
    } catch (error) {
      // Add specific handling for unique constraint violations
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error(`Unique constraint violation: ${error.message}`);
      }

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
        status: 'ACTIVE',
      },
      include: {
        user: true,
        manager: true,
        position: {
          include: {
            rolePosition: true,
          },
        },
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

    // Transform the response to match expected types
    const transformedContract = this.transformPrismaResponse(contracts[0]);

    return this.mapper.toDomain(transformedContract);
  }
}
