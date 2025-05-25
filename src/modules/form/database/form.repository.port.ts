import { RepositoryPort } from '@libs/ddd';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { FormEntity } from '../domain/form.entity';

export interface FormRepositoryPort extends RepositoryPort<FormEntity> {
  findFormDropDown(): Promise<DropDownResult[]>;
}
