import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import {
  FormDescription as FormDescriptionModel,
  Prisma,
} from '@prisma/client';
import { Paginated, PrismaPaginatedQueryParams } from '@src/libs/ddd';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { IField } from '@src/libs/utils';
import { FormDescriptionEntity } from '../domain/form-description.entity';
import { FormDescriptionMapper } from '../mappers/form-description.mapper';
import { FormDescriptionRepositoryPort } from './form-description.repository.port';

export const FormDescriptionScalarFieldEnum =
  Prisma.FormDescriptionScalarFieldEnum;

@Injectable()
export class PrismaFormDescriptionRepository
  extends PrismaMultiTenantRepositoryBase<
    FormDescriptionEntity,
    FormDescriptionModel
  >
  implements FormDescriptionRepositoryPort
{
  protected modelName = 'formDescription';

  constructor(
    private manager: PrismaClientManager,
    mapper: FormDescriptionMapper,
  ) {
    super(manager, mapper);
  }

  async findAllPaginatedQuickSearch(
    params: PrismaPaginatedQueryParams<Prisma.FormDescriptionWhereInput> & {
      quickSearch?: string;
    },
  ): Promise<Paginated<FormDescriptionEntity>> {
    const searchableFields: IField[] = [
      { field: 'code', type: 'string' },
      { field: 'reason', type: 'string' },
      { field: 'status', type: 'string' },
      { field: 'submittedBy', type: 'string' },
    ];
    const { quickSearch, ...rest } = params;
    return await this.findAllPaginatedWithQuickSearch<Prisma.FormDescriptionWhereInput>(
      {
        ...rest,
        ...(quickSearch && {
          quickSearch: {
            quickSearchString: quickSearch,
            searchableFields,
          },
        }),
      },
    );
  }
}
