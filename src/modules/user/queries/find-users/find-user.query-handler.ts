import { Prisma } from '@prisma/client';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { UserEntity } from '../../domain/user.entity';
import { Paginated } from '@src/libs/ddd';
import { QueryHandler } from '@nestjs/cqrs';
import { USER_REPOSITORY } from '../../user.di-tokens';
import { Inject } from '@nestjs/common';
import { UserRepositoryPort } from '../../database/user.repository.port';

export class FindUserQuery extends PrismaPaginatedQueryBase<Prisma.UserWhereInput> {}

export type FindUserQueryResult = Result<Paginated<UserEntity>, void>;

@QueryHandler(FindUserQuery)
export class FindUserQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    protected readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(query: FindUserQuery): Promise<FindUserQueryResult> {
    const result = await this.userRepo.findAllUser(query);

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
