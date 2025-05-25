import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Form as FormModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { FormEntity } from '../domain/form.entity';
import { FormRepositoryPort } from './form.repository.port';
import { FormMapper } from '../mappers/form.mapper';

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

  async findFormDropDown(): Promise<DropDownResult[]> {
    const client = await this._getClient();
    const result = await client.role.findMany({
      select: {
        roleCode: true,
        roleName: true,
      },
      orderBy: { roleCode: 'asc' },
    });
    return result.map((item) => ({
      label: item.roleName,
      value: item.roleCode,
    }));
  }
}
