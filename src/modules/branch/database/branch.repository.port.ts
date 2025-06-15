import { Paginated, RepositoryPort } from '@libs/ddd';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { BranchEntity } from '../domain/branch.entity';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Prisma } from '@prisma/client';

export interface BranchRepositoryPort extends RepositoryPort<BranchEntity> {
  findBranchDropDown(userCode?: string): Promise<DropDownResult[]>;
  checkExist(branchCode: string): Promise<boolean>;
  findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.BranchWhereInput> & {
      quickSearch?: string | number;
    },
  ): Promise<Paginated<BranchEntity>>;
}
