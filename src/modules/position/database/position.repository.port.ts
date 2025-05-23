import { RepositoryPort } from '@libs/ddd';
import { PositionEntity } from '../domain/position.entity';
import { DropDownResult } from '@src/libs/utils/dropdown.util';

export interface PositionRepositoryPort extends RepositoryPort<PositionEntity> {
  findPositionDropDown(roleCode?: string): Promise<DropDownResult[]>;
}
