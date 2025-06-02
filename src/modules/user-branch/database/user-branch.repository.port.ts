import { Paginated, RepositoryPort } from '@libs/ddd';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { UserBranchEntity } from '../domain/user-branch.entity';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Prisma } from '@prisma/client';

export interface UserBranchRepositoryPort
  extends RepositoryPort<UserBranchEntity> {
  findUserBranchDropDown(): Promise<DropDownResult[]>;
  findUserBranchByBranchCode(branchCode: string): Promise<UserBranchEntity[]>;
  findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.UserBranchWhereInput> & {
      quickSearch?: string | number;
    },
  ): Promise<Paginated<UserBranchEntity>>;
}
