import {
  Paginated,
  PrismaPaginatedQueryParams,
  RepositoryPort,
} from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { FormDescriptionEntity } from '../domain/form-description.entity';

export interface FormDescriptionRepositoryPort
  extends RepositoryPort<FormDescriptionEntity> {
  findAllPaginatedQuickSearch(
    params: PrismaPaginatedQueryParams<Prisma.FormDescriptionWhereInput> & {
      quickSearch?: string | number | Date;
    },
  ): Promise<Paginated<FormDescriptionEntity>>;
}
