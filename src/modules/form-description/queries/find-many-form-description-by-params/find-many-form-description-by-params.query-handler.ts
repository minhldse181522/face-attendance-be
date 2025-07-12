import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import { FormDescriptionNotFoundError } from '../../domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';

export class FindManyFormDescriptionByParamsQuery extends PrismaQueryBase<Prisma.FormDescriptionWhereInput> {}

export type FindManyFormDescriptionByParamsQueryResult = Result<
  FormDescriptionEntity[],
  FormDescriptionNotFoundError
>;

@QueryHandler(FindManyFormDescriptionByParamsQuery)
export class FindManyFormDescriptionByParamsQueryHandler {
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    protected readonly formDescriptionRepo: FormDescriptionRepositoryPort,
  ) {}

  async execute(
    query: FindManyFormDescriptionByParamsQuery,
  ): Promise<FindManyFormDescriptionByParamsQueryResult> {
    const found =
      await this.formDescriptionRepo.findManyFormDescriptionByParams(query);
    if (!found.length) {
      return Err(new FormDescriptionNotFoundError());
    }
    return Ok(found);
  }
}
