import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { UserContract as UserContractModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { UserContractEntity } from '../domain/user-contract.entity';
import { UserContractMapper } from '../mappers/user-contract.mapper';
import { UserContractRepositoryPort } from './user-contract.repository.port';

@Injectable()
export class PrismaUserContractRepository
  extends PrismaMultiTenantRepositoryBase<UserContractEntity, UserContractModel>
  implements UserContractRepositoryPort
{
  protected modelName = 'userContract';

  constructor(
    private manager: PrismaClientManager,
    mapper: UserContractMapper,
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

  async findUserContractDropDown(): Promise<DropDownResult[]> {
    const client = await this._getClient();
    const result = await client.userContract.findMany({
      select: {
        code: true,
        title: true,
      },
      orderBy: { code: 'asc' },
    });
    return result.map((item) => ({
      label: item.title || '',
      value: item.code || '',
    }));
  }
}
