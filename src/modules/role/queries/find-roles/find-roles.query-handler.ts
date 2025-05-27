import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { RoleRepositoryPort } from '../../database/role.repository.port';
import { ROLE_REPOSITORY } from '../../role.di-tokens';
import { RoleEntity } from '../../domain/role.entity';

export class FindRoleQuery extends PrismaPaginatedQueryBase<Prisma.RoleWhereInput> {}

export type FindRoleQueryResult = Result<Paginated<RoleEntity>, void>;

@QueryHandler(FindRoleQuery)
export class FindRoleQueryHandler {
  constructor(
    @Inject(ROLE_REPOSITORY)
    protected readonly roleRepo: RoleRepositoryPort,
  ) {}

  async execute(query: FindRoleQuery): Promise<FindRoleQueryResult> {
    const result = await this.roleRepo.findAllPaginated(query);

    return Ok(
      new Paginated({
        data: result.data,
        count: result.count,
        limit: query.limit,
        page: query.page,
      }),
    );
  }
}
