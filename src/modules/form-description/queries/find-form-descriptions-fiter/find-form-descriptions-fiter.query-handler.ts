import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';
import { GeneratedFindOptions } from '@chax-at/prisma-filter';

export class FindFormDescriptionQueryFiter extends PrismaPaginatedQueryBase<Prisma.FormDescriptionWhereInput> {
  quickSearch?: string | number;
  formId?: string;
  fromDate?: string;
  toDate?: string;

  constructor(
    props: GeneratedFindOptions<Prisma.FormDescriptionWhereInput> & {
      quickSearch?: string | number;
      formId?: string;
      fromDate?: string;
      toDate?: string;
    },
  ) {
    super(props);
    Object.assign(this, props);
  }
}

export type FindFormDescriptionQueryResult = Result<
  Paginated<FormDescriptionEntity>,
  void
>;

@QueryHandler(FindFormDescriptionQueryFiter)
export class FindFormDescriptionFiterQueryHandler {
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    protected readonly formDescriptionRepo: FormDescriptionRepositoryPort,
  ) {}

  async execute(
    query: FindFormDescriptionQueryFiter,
  ): Promise<FindFormDescriptionQueryResult> {
    const result = await this.formDescriptionRepo.findAllPaginatedQuickSearch({
      ...query,
      quickSearch: query.quickSearch,
      fromDate: query.fromDate,
      toDate: query.toDate,
      formId: query.formId,
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
