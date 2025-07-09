import { RepositoryPort } from '@libs/ddd';
import { ShiftEntity } from '../domain/shift.entity';
import { Prisma } from '@prisma/client';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { Option } from 'oxide.ts';
import { DropDownResult } from '@src/libs/utils/dropdown.util';

export interface ShiftRepositoryPort extends RepositoryPort<ShiftEntity> {
  findShiftByParams(
    params: PrismaQueryBase<Prisma.ShiftWhereInput>,
  ): Promise<Option<ShiftEntity>>;
  findShiftDropDown(): Promise<DropDownResult[]>;
  findAllShift(
    params: PrismaPaginatedQueryBase<Prisma.ShiftWhereInput>,
    status?: string,
  );
}
