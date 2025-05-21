import { OrderBy, PaginatedQueryParams } from './repository.port';

/**
 * Base class for regular queries
 */
export abstract class QueryBase {}

/**
 * Base class for paginated queries
 */
export abstract class PaginatedQueryBase extends QueryBase {
  page: number;
  limit: number;
  offset: number;
  orderBy: OrderBy;
  where?: Record<string, any>;

  constructor(props: PaginatedParams<PaginatedQueryBase>) {
    super();
    this.page = props.page || 1;
    this.limit = props.limit || 10;
    this.offset = props.page ? (props.page - 1) * this.limit : 0;
    this.orderBy = props.orderBy || { field: 'id', param: 'desc' };
    this.where = props.where || {};
  }
}

// Paginated query parameters
export type PaginatedParams<T> = Omit<
  T,
  'limit' | 'offset' | 'orderBy' | 'page'
> &
  Partial<Omit<PaginatedQueryParams, 'offset'>>;
