import {
  Paginated,
  PrismaPaginatedQueryParams,
  RepositoryPort,
} from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { FormEntity } from '../domain/form.entity';

export interface FormRepositoryPort extends RepositoryPort<FormEntity> {
  checkExist(formId: bigint): Promise<boolean>;
  findAllPaginatedQuickSearch(
    params: PrismaPaginatedQueryParams<Prisma.FormWhereInput> & {
      quickSearch?: string | number | Date;
    },
  ): Promise<Paginated<FormEntity>>;
}
