import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Branch as BranchModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { BranchEntity } from '../domain/branch.entity';
import { BranchMapper } from '../mappers/branch.mapper';
import { BranchRepositoryPort } from './branch.repository.port';

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
}
