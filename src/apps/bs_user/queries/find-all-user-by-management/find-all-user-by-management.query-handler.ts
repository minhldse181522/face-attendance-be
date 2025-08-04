import { GeneratedFindOptions } from '@chax-at/prisma-filter';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { Ok, Result } from 'oxide.ts';
import { BS_USER_REPOSITORY } from '../../bs-user.di-tokens';
import { BsUserRepositoryPort } from '../../database/bs-user.repository.port';

export class FindAllUserByManagementQuery extends PrismaPaginatedQueryBase<Prisma.UserWhereInput> {
  quickSearch?: string | number;
  userCode?: string;
  isActive?: boolean;
  position?: string;
  branch?: string;
  constructor(
    props: GeneratedFindOptions<Prisma.UserWhereInput> & {
      quickSearch?: string | number;
      userCode?: string;
      isActive?: boolean;
      position?: string;
      branch?: string;
    },
  ) {
    super(props);
    this.userCode = props.userCode;
    this.isActive = props.isActive;
    this.position = props.position;
    this.branch = props.branch;
    Object.assign(this, props);
  }
}

export type FindAllUserByManagementQueryResult = Result<
  Paginated<UserEntity>,
  void
>;

@QueryHandler(FindAllUserByManagementQuery)
export class FindAllUserByManagementQueryHandler {
  constructor(
    @Inject(BS_USER_REPOSITORY)
    protected readonly bsUserRepo: BsUserRepositoryPort,
  ) {}

  async execute(
    query: FindAllUserByManagementQuery,
  ): Promise<FindAllUserByManagementQueryResult> {
    const result = await this.bsUserRepo.findAllUserByManagement(
      {
        ...query,
        quickSearch: query.quickSearch,
      },
      query.userCode,
      query.isActive,
      query.position,
      query.branch,
    );

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
