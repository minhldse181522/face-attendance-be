import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Err, Ok, Result } from 'oxide.ts';
import { ShiftRepositoryPort } from '../../database/shift.repository.port';
import { ShiftEntity } from '../../domain/shift.entity';
import { ShiftNotFoundError } from '../../domain/shift.error';
import { SHIFT_REPOSITORY } from '../../shift.di-tokens';

export class FindShiftByParamsQuery extends PrismaQueryBase<Prisma.ShiftWhereInput> {}

export type FindShiftByParamsQueryResult = Result<
  ShiftEntity,
  ShiftNotFoundError
>;

@QueryHandler(FindShiftByParamsQuery)
export class FindShiftByParamsQueryHandler {
  constructor(
    @Inject(SHIFT_REPOSITORY)
    protected readonly shiftRepo: ShiftRepositoryPort,
  ) {}

  async execute(
    query: FindShiftByParamsQuery,
  ): Promise<FindShiftByParamsQueryResult> {
    const found = await this.shiftRepo.findShiftByParams(query);
    if (found.isNone()) {
      return Err(new ShiftNotFoundError());
    }
    const shift = found.unwrap();
    return Ok(shift);
  }
}
