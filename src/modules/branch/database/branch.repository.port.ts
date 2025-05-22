import { RepositoryPort } from '@libs/ddd';
import { BranchEntity } from '../domain/branch.entity';
import { DropDownResult } from '@src/libs/utils/dropdown.util';

export interface BranchRepositoryPort extends RepositoryPort<BranchEntity> {
  findBranchDropDown(): Promise<DropDownResult[]>;
}
