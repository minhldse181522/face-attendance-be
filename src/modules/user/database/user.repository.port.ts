import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { Option } from 'oxide.ts';
import { UserEntity } from '../domain/user.entity';

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  findByUsername(userName: string): Promise<UserEntity | null>;
  findAllUser(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
    role?: string,
    isActive?: boolean,
  ): Promise<Paginated<UserEntity>>;
  findUserDropDown(
    branchCode?: string[],
    roleCode?: string,
  ): Promise<DropDownResult[]>;
  findUserWithActiveContract(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
  ): Promise<Paginated<UserEntity>>;
  findUserByParams(
    params: PrismaQueryBase<Prisma.UserWhereInput>,
  ): Promise<Option<UserEntity>>;
  existsByCode(code: string): Promise<boolean>;
}
