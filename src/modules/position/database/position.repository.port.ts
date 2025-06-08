import { RepositoryPort } from '@libs/ddd';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { PositionEntity } from '../domain/position.entity';

export interface PositionRepositoryPort extends RepositoryPort<PositionEntity> {
  findPositionDropDown(roleCode?: string): Promise<DropDownResult[]>;
}
