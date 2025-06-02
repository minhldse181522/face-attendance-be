import { RepositoryPort } from '@libs/ddd';
import { UserContractEntity } from '../domain/user-contract.entity';

export interface UserContractRepositoryPort
  extends RepositoryPort<UserContractEntity> {
  createWithBranches(
    entity: UserContractEntity,
    branchCodes: string[],
    createdBy: string,
  ): Promise<UserContractEntity>;
  checkExist(userContractCode: string): Promise<boolean>;
}
