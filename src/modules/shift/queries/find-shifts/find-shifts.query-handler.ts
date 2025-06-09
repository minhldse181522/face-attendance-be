import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { ShiftRepositoryPort } from '../../database/shift.repository.port';
import { ShiftEntity } from '../../domain/shift.entity';
import { SHIFT_REPOSITORY } from '../../shift.di-tokens';

export class FindShiftQuery extends PrismaPaginatedQueryBase<Prisma.ShiftWhereInput> {}

export type FindShiftQueryResult = Result<Paginated<ShiftEntity>, void>;

@QueryHandler(FindShiftQuery)
export class FindShiftQueryHandler {
  constructor(
    @Inject(SHIFT_REPOSITORY)
    protected readonly shiftRepo: ShiftRepositoryPort,
  ) {}

  async execute(query: FindShiftQuery): Promise<FindShiftQueryResult> {
    const result = await this.shiftRepo.findAllPaginated(query);

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
