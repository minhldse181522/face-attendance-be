import { Paginated, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { DropDownResponseDto } from '@src/modules/dropdown/dtos/dropdown.response.dto';
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
  findUserByManagement(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput> & {
      userCode: string;
      quickSearch?: string | number;
    },
  ): Promise<Paginated<DropDownResponseDto>>;
  findAllUserByManagement(
    params: PrismaPaginatedQueryBase<Prisma.UserWhereInput>,
    userCode?: string,
  ): Promise<Paginated<UserEntity>>;
}
