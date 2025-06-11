import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { UserRepositoryPort } from '../../database/user.repository.port';
import { UserEntity } from '../../domain/user.entity';
import { UserNotFoundError } from '../../domain/user.error';
import { USER_REPOSITORY } from '../../user.di-tokens';

export class FindUserByParamsQuery extends PrismaQueryBase<Prisma.UserWhereInput> {}

export type FindUserByParamsQueryResult = Result<UserEntity, UserNotFoundError>;

@QueryHandler(FindUserByParamsQuery)
export class FindUserByParamsQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    protected readonly UserRepo: UserRepositoryPort,
  ) {}

  async execute(
    query: FindUserByParamsQuery,
  ): Promise<FindUserByParamsQueryResult> {
    const found = await this.UserRepo.findUserByParams(query);
    if (found.isNone()) {
      return Err(new UserNotFoundError());
    }
    const shift = found.unwrap();
    return Ok(shift);
  }
}
