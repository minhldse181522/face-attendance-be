import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { UserEntity } from '@src/modules/user/domain/user.entity';

export interface BsUserRepositoryPort extends RepositoryPort<UserEntity> {
  findUserWithActiveContract(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
  ): Promise<Paginated<UserEntity>>;
  findFullUserInforByParam(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
    role?: string,
    isActive?: boolean,
    position?: string,
    branch?: string,
  ): Promise<Paginated<UserEntity>>;
}
