import { RepositoryPort } from '@libs/ddd';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { RoleEntity } from '../domain/role.entity';

export interface RoleRepositoryPort extends RepositoryPort<RoleEntity> {
  findRoleDropDown(): Promise<DropDownResult[]>;
}
