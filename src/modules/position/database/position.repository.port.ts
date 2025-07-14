import { Paginated, RepositoryPort } from '@libs/ddd';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { PositionEntity } from '../domain/position.entity';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { Prisma } from '@prisma/client';
import { Option } from 'oxide.ts';

export interface PositionRepositoryPort extends RepositoryPort<PositionEntity> {
  findPositionDropDown(roleCode?: string): Promise<DropDownResult[]>;
  findPositionByParams(
    params: PrismaQueryBase<Prisma.PositionWhereInput>,
  ): Promise<Option<PositionEntity>>;
  findPositionByUsercode(
    params: PrismaPaginatedQueryBase<Prisma.PositionWhereInput>,
    userCode?: string,
  ): Promise<Paginated<PositionEntity>>;
}
