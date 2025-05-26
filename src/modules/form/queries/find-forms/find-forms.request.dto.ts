import { Prisma } from '@prisma/client';
import { FilterDtoWithQuickSearch } from '@src/libs/application/validators/prisma-filter.validator';

export class FindFormRequestDto extends FilterDtoWithQuickSearch<Prisma.FormWhereInput> {}
