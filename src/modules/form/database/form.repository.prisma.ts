import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Form as FormModel, Prisma } from '@prisma/client';
import { Paginated, PrismaPaginatedQueryParams } from '@src/libs/ddd';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { IField } from '@src/libs/utils';
import { FormEntity } from '../domain/form.entity';
import { FormMapper } from '../mappers/form.mapper';
import { FormRepositoryPort } from './form.repository.port';

export const FormScalarFieldEnum = Prisma.FormScalarFieldEnum;
@Injectable()
export class PrismaFormRepository
  extends PrismaMultiTenantRepositoryBase<FormEntity, FormModel>
  implements FormRepositoryPort
{
  protected modelName = 'form';

  constructor(
    private manager: PrismaClientManager,
    mapper: FormMapper,
  ) {
    super(manager, mapper);
  }

  async findAllPaginatedQuickSearch(
    params: PrismaPaginatedQueryParams<Prisma.FormWhereInput> & {
      quickSearch?: string;
    },
  ): Promise<Paginated<FormEntity>> {
    const searchableFields: IField[] = [
      { field: 'title', type: 'string' },
      { field: 'description', type: 'string' },
      { field: 'roleCode', type: 'string' },
    ];
    const { quickSearch, ...rest } = params;
    return await this.findAllPaginatedWithQuickSearch<Prisma.FormWhereInput>({
      ...rest,
      ...(quickSearch && {
        quickSearch: {
          quickSearchString: quickSearch,
          searchableFields,
        },
      }),
    });
  }
}
