import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { Option } from 'oxide.ts';
import { UserBranchEntity } from '../domain/user-branch.entity';

export interface UserBranchRepositoryPort
  extends RepositoryPort<UserBranchEntity> {
  findUserBranchDropDown(): Promise<DropDownResult[]>;
  findUserBranchByBranchCode(branchCode: string): Promise<UserBranchEntity[]>;
  findPaginatedWithQuickSearch(
    params: PrismaPaginatedQueryBase<Prisma.UserBranchWhereInput> & {
      quickSearch?: string | number;
    },
  ): Promise<Paginated<UserBranchEntity>>;
  findUserBranchByParams(
    params: PrismaQueryBase<Prisma.UserBranchWhereInput>,
  ): Promise<Option<UserBranchEntity>>;
}
