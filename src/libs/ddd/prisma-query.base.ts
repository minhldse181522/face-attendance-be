import { GeneratedFindOptions, OrderBy } from '@chax-at/prisma-filter';
import { QueryBase } from './query-base';

/**
 * Base class for paginated queries using Prisma
 */
export abstract class PrismaPaginatedQueryBase<TWhereInput> extends QueryBase {
  readonly page: number;
  readonly limit: number;
  readonly offset: number;
  readonly orderBy: OrderBy<TWhereInput>;
  readonly where?: TWhereInput;

  constructor(props: GeneratedFindOptions<TWhereInput>) {
    super();
    this.page = Math.floor((props?.skip ?? 0) / (props?.take ?? 10)) + 1; // Default page
    this.limit = props?.take ?? 10; // Default limit
    this.offset = props?.skip ?? 0; // Default offset
    this.orderBy = props?.orderBy || [{ id: 'asc' }]; // Default orderBy
    this.where = props?.where || undefined; // Default where
  }
}

export abstract class PrismaQueryBase<TWhereInput> extends QueryBase {
  readonly orderBy?: OrderBy<TWhereInput>;
  readonly where?: TWhereInput;

  constructor(props?: { where?: TWhereInput; orderBy?: OrderBy<TWhereInput> }) {
    super();
    this.orderBy = props?.orderBy || undefined; // Default orderBy
    this.where = props?.where || undefined; // Default where
  }
}
