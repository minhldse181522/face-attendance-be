import { GeneratedFindOptions, OrderBy } from '@chax-at/prisma-filter';
import { QueryBase } from './query-base';

/**
 * Base class for paginated queries using Prisma
 */
export abstract class PrismaPaginatedQueryWithQuickSearchBase<
  TWhereInput,
> extends QueryBase {
  readonly page: number;
  readonly limit: number;
  readonly offset: number;
  readonly orderBy: OrderBy<TWhereInput>;
  readonly where?: TWhereInput;
  readonly quickSearch?: string | number;

  constructor(
    props: GeneratedFindOptions<TWhereInput> & {
      quickSearch?: string | number;
    },
  ) {
    super();
    this.page = Math.floor((props?.skip ?? 0) / (props?.take ?? 10)) + 1; // Default page
    this.limit = props?.take ?? 10; // Default limit
    this.offset = props?.skip ?? 0; // Default offset
    this.orderBy = props?.orderBy || [{ id: 'asc' }]; // Default orderBy
    this.where = props?.where || undefined; // Default where\
    this.quickSearch = props?.quickSearch || undefined; // Default quickSearch
  }
}

export abstract class PrismaQueryWithQuickSearchBase<
  TWhereInput,
> extends QueryBase {
  readonly orderBy?: OrderBy<TWhereInput>;
  readonly where?: TWhereInput;
  readonly quickSearch?: string | number;

  constructor(
    props?: { where?: TWhereInput; orderBy?: OrderBy<TWhereInput> } & {
      quickSearch?: string | number;
    },
  ) {
    super();
    this.orderBy = props?.orderBy || undefined; // Default orderBy
    this.where = props?.where || undefined; // Default where
    this.quickSearch = props?.quickSearch || undefined; // Default quickSearch
  }
}
