import { Prisma } from '@prisma/client';
import { FilterDtoWithQuickSearch } from '@src/libs/application/validators/prisma-filter.validator';

export class FindBranchsRequestDto extends FilterDtoWithQuickSearch<Prisma.BranchWhereInput> {}
