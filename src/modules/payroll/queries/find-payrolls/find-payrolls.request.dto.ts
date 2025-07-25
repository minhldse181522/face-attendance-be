import { Prisma } from '@prisma/client';
import { FilterDtoWithQuickSearch } from '@src/libs/application/validators/prisma-filter.validator';

export class FindPayrollsRequestDto extends FilterDtoWithQuickSearch<Prisma.PayrollWhereInput> {}
