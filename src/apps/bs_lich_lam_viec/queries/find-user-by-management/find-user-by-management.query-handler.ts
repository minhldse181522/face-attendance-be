import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { BS_USER_REPOSITORY } from '@src/apps/bs_user/bs-user.di-tokens';
import { BsUserRepositoryPort } from '@src/apps/bs_user/database/bs-user.repository.port';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryWithQuickSearchBase } from '@src/libs/ddd/prisma-query-with-quick-search.base';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { Ok, Result } from 'oxide.ts';
import { FindUserByManagementRequestDto } from './find-user-by-management.request.dto';
import { DropDownResponseDto } from '../../dtos/dropdown.response.dto';

export class FindUserByManagementQuery extends PrismaPaginatedQueryWithQuickSearchBase<Prisma.UserWhereInput> {
  userCode: string;
  quickSearch?: string | number;
  constructor(props: FindUserByManagementRequestDto) {
    super(props.findOptions);
    Object.assign(this, props);
  }
}

export type FindUserByManagementQueryResult = Result<
  Paginated<DropDownResponseDto>,
  void
>;

@QueryHandler(FindUserByManagementQuery)
export class FindUserByManagementQueryHandler {
  constructor(
    @Inject(BS_USER_REPOSITORY)
    protected readonly userRepo: BsUserRepositoryPort,
  ) {}

  async execute(
    query: FindUserByManagementQuery,
  ): Promise<FindUserByManagementQueryResult> {
    const result = await this.userRepo.findUserByManagement(query);

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
