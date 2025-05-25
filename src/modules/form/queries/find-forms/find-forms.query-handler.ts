import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { FormEntity } from '../../domain/form.entity';
import { FormRepositoryPort } from '../../database/form.repository.port';
import { FORM_REPOSITORY } from '../../form.di-tokens';
import { GeneratedFindOptions } from '@chax-at/prisma-filter';
export class FindFormQuery extends PrismaPaginatedQueryBase<Prisma.FormWhereInput> {
  constructor(
    props: GeneratedFindOptions<Prisma.FormWhereInput> & {
      quickSearch?: string | number;
    },
  ) {
    super(props);
    Object.assign(this, props);
  }
}

export type FindFormQueryResult = Result<Paginated<FormEntity>, void>;

@QueryHandler(FindFormQuery)
export class FindFormQueryHandler {
  constructor(
    @Inject(FORM_REPOSITORY)
    protected readonly formRepo: FormRepositoryPort,
  ) {}

  async execute(query: FindFormQuery): Promise<FindFormQueryResult> {
    const result = await this.formRepo.findAllPaginatedQuickSearch({
      ...query,
    });

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
