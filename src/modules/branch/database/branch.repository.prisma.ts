import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Branch as BranchModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { BranchEntity } from '../domain/branch.entity';
import { BranchMapper } from '../mappers/branch.mapper';
import { BranchRepositoryPort } from './branch.repository.port';
import { DropDownResult } from '@src/libs/utils/dropdown.util';

@Injectable()
export class PrismaBranchRepository
  extends PrismaMultiTenantRepositoryBase<BranchEntity, BranchModel>
  implements BranchRepositoryPort
{
  protected modelName = 'branch';

  constructor(
    private manager: PrismaClientManager,
    mapper: BranchMapper,
  ) {
    super(manager, mapper);
  }

  async findBranchDropDown(): Promise<DropDownResult[]> {
    const client = await this._getClient();
    const result = await client.branch.findMany({
      select: {
        code: true,
        branchName: true,
      },
      orderBy: { code: 'asc' },
    });
    return result.map((item) => ({
      label: item.branchName,
      value: item.code,
    }));
  }
}
