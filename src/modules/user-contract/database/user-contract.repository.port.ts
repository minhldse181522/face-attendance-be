import { RepositoryPort } from '@libs/ddd';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { UserContractEntity } from '../domain/user-contract.entity';

export interface UserContractRepositoryPort
  extends RepositoryPort<UserContractEntity> {
  checkExist(userContractCode: string): Promise<boolean>;
  findUserContractDropDown(): Promise<DropDownResult[]>;
}
