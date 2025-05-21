import { Option } from 'oxide.ts';
import { OrderBy as PrismaOrderBy } from '@chax-at/prisma-filter';
import { AggregateRoot } from './aggregate-root.base';

/*  Most of repositories will probably need generic 
    save/find/delete operations, so it's easier
    to have some shared interfaces.
    More specific queries should be defined
    in a respective repository.
*/

export class Paginated<T> {
  readonly count: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];

  constructor(props: Paginated<T>) {
    this.count = props.count;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}

export type OrderBy = { field: string; param: 'asc' | 'desc' };

export type PaginatedQueryParams = {
  limit: number;
  page: number;
  offset: number;
  orderBy: OrderBy;
  where?: Record<string, any>;
};

export type PrismaPaginatedQueryParams<TWhereInput> = {
  limit: number;
  page: number;
  offset: number;
  orderBy: PrismaOrderBy<TWhereInput>;
  where?: TWhereInput;
};

export interface RepositoryPort<Entity extends AggregateRoot<any, any>> {
  insert(entity: Entity): Promise<Entity>;
  insertMany(entities: Entity[]): Promise<Entity[]>;
  update(entity: Entity): Promise<Entity>;
  updateMany(entities: Entity[]): Promise<Entity[]>;
  findOneById(id: bigint): Promise<Option<Entity>>;
  findAll(where: Record<string, unknown>): Promise<Entity[]>;
  findAllPaginated<T>(
    params: PrismaPaginatedQueryParams<T>,
  ): Promise<Paginated<Entity>>;
  delete(entity: Entity): Promise<boolean>;
  deleteMany(where: Record<string, unknown>): Promise<boolean>;
  transaction<T>(handler: () => Promise<T>): Promise<T>;
}
