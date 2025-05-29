import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { UserEntity } from '../domain/user.entity';
import { DropDownResult } from '@src/libs/utils/dropdown.util';

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  findByUsername(userName: string): Promise<UserEntity | null>;
  findAllUser(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
    role?: string,
    isActive?: boolean,
  ): Promise<Paginated<UserEntity>>;
  findUserDropDown(
    // branchCode?: string,
    roleCode?: string,
  ): Promise<DropDownResult[]>;
}
