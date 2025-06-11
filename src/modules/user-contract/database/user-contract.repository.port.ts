import { RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { UserContractEntity } from '../domain/user-contract.entity';
import { Option } from 'oxide.ts';

export interface UserContractRepositoryPort
  extends RepositoryPort<UserContractEntity> {
  createWithBranches(
    entity: UserContractEntity,
    branchCodes: string[],
    createdBy: string,
  ): Promise<UserContractEntity>;
  checkExist(userContractCode: string): Promise<boolean>;
  findByUserCode(userCode: string): Promise<UserContractEntity>;
  checkManagedBy(user: string): Promise<boolean>;
  findUserContractByParams(
    params: PrismaQueryBase<Prisma.UserContractWhereInput>,
  ): Promise<Option<UserContractEntity>>;
}
