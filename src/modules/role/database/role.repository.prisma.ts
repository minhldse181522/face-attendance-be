import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { Role as RoleModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { RoleEntity } from '../domain/role.entity';
import { RoleMapper } from '../mappers/role.mapper';
import { RoleRepositoryPort } from './role.repository.port';

@Injectable()
export class PrismaRoleRepository
  extends PrismaMultiTenantRepositoryBase<RoleEntity, RoleModel>
  implements RoleRepositoryPort
{
  protected modelName = 'role';

  constructor(
    private manager: PrismaClientManager,
    mapper: RoleMapper,
  ) {
    super(manager, mapper);
  }

  async findRoleDropDown(): Promise<DropDownResult[]> {
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
