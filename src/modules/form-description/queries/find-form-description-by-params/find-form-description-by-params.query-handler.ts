import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import { FormDescriptionNotFoundError } from '../../domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';

export class FindFormDescriptionByParamsQuery extends PrismaQueryBase<Prisma.FormDescriptionWhereInput> {}

export type FindFormDescriptionByParamsQueryResult = Result<
  FormDescriptionEntity,
  FormDescriptionNotFoundError
>;

@QueryHandler(FindFormDescriptionByParamsQuery)
export class FindFormDescriptionByParamsQueryHandler {
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    protected readonly FormDescriptionRepo: FormDescriptionRepositoryPort,
  ) {}

  async execute(
    query: FindFormDescriptionByParamsQuery,
  ): Promise<FindFormDescriptionByParamsQueryResult> {
    const found =
      await this.FormDescriptionRepo.findFormDescriptionByParams(query);
    if (found.isNone()) {
      return Err(new FormDescriptionNotFoundError());
    }
    const formDescription = found.unwrap();
    return Ok(formDescription);
  }
}
