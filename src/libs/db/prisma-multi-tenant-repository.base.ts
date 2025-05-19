import { None, Option, Some } from 'oxide.ts';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RequestContextService } from '../application/context/AppRequestContext';
import {
  AggregateRoot,
  Mapper,
  Paginated,
  PrismaPaginatedQueryParams,
  RepositoryPort,
} from '../ddd';
import { ConflictException, NotFoundException } from '../exceptions';
import { ObjectLiteral } from '../types';

export interface PrismaClientManager {
  getClient(tenantId?: string): PrismaClient;
}

export abstract class PrismaMultiTenantRepositoryBase<
  Aggregate extends AggregateRoot<any, any>,
  DbModel extends ObjectLiteral,
> implements RepositoryPort<Aggregate>
{
  protected abstract modelName: string;
  protected clients = new Map<string, PrismaClient>();

  protected constructor(
    protected readonly clientManager: PrismaClientManager,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
  ) {}

  async findOneById(id: bigint): Promise<Option<Aggregate>> {
    // Get client by context
    const client = await this._getClient();

    const result = await client[this.modelName].findFirst({
      where: { id },
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  async findAll<T>(
    where: PrismaPaginatedQueryParams<T>['where'],
  ): Promise<Aggregate[]> {
    // Get client by context
    const client = await this._getClient();

    const result = await client[this.modelName].findMany({ where });
    return result.map(this.mapper.toDomain);
  }

  async findAllPaginated<T>(
    params: PrismaPaginatedQueryParams<T>,
  ): Promise<Paginated<Aggregate>> {
    // Get client by context
    const client = await this._getClient();

    const { limit, offset, page, where = {}, orderBy } = params;

    const [data, count] = await Promise.all([
      client[this.modelName].findMany({
        skip: offset,
        take: limit,
        where: { ...where },
        orderBy,
      }),

      client[this.modelName].count({ where: { ...where } }),
    ]);

    return new Paginated({
      data: data.map(this.mapper.toDomain),
      count,
      limit,
      page,
    });
  }

  async delete(entity: Aggregate): Promise<boolean> {
    // Get client by context
    const client = await this._getClient();

    try {
      const result = await client[this.modelName].delete({
        where: { id: entity.id },
      });

      return !!result;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Record not found');
      }

      throw error;
    }
  }

  async deleteMany(where: Record<string, unknown>): Promise<boolean> {
    // Get client by context
    const client = await this._getClient();

    const result = await client[this.modelName].deleteMany({ where });
    return !!result.count;
  }

  async update(entity: Aggregate): Promise<Aggregate> {
    // Get client by context
    const client = await this._getClient();

    try {
      const record = this.mapper.toPersistence(entity);

      const updatedRecord = await client[this.modelName].update({
        where: { id: entity.id },
        data: record,
      });
      return this.mapper.toDomain(updatedRecord);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Record not found');
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Record already exists', error);
      }

      throw error;
    }
  }

  async updateMany(entities: Aggregate[]): Promise<Aggregate[]> {
    // Get client by context
    const client = await this._getClient();

    const records = entities.map((entity) => this.mapper.toPersistence(entity));

    const updatedRecords = await client.$transaction(
      records.map((record) =>
        client[this.modelName].update({
          where: { id: record.id },
          data: record,
        }),
      ),
    );

    return updatedRecords.map(this.mapper.toDomain);
  }

  async insert(entity: Aggregate): Promise<Aggregate> {
    // Get client by context
    const client = await this._getClient();

    const record = this.mapper.toPersistence(entity);
    delete record.id; // remove id to let Prisma generate it

    try {
      const createdRecord = await client[this.modelName].create({
        data: record,
      });
      return this.mapper.toDomain(createdRecord);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Record already exists', error);
      }

      throw error;
    }
  }

  async insertMany(entities: Aggregate[]): Promise<Aggregate[]> {
    // Get client by context
    const client = await this._getClient();

    const records = entities.map((entity) => this.mapper.toPersistence(entity));

    try {
      const createdRecords = await client.$transaction(
        records.map((record) => {
          delete record.id; // remove id to let Prisma generate it

          return client[this.modelName].create({
            data: record,
          });
        }),
      );

      return createdRecords.map(this.mapper.toDomain);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Record already exists', error);
      }

      throw error;
    }
  }

  async transaction<T>(handler: () => Promise<T>): Promise<T> {
    // Get client by context
    const client = await this._getClient();

    return client.$transaction(handler);
  }

  async countInUseValue({
    column,
    value,
    excludeTables = [],
  }: {
    column: string;
    value: string | number;
    excludeTables?: string[];
  }): Promise<number> {
    // Get client by context
    const client = await this._getClient();

    // find all tables that have the same column name
    const findTablesSql = Prisma.sql`
      SELECT n.nspname AS schema ,c.relname AS table
      FROM pg_class AS c
      INNER JOIN pg_attribute AS a ON a.attrelid = c.oid
      INNER JOIN pg_namespace AS n ON c.relnamespace = n.oid
      WHERE a.attname = ${column} AND c.relkind = 'r'
    `;
    const foundTables =
      await client.$queryRaw<Array<{ schema: string; table: string }>>(
        findTablesSql,
      );

    if (!foundTables.length) return 0;

    // filter out tables that are excluded
    const filteredTables = foundTables.filter(
      (table) => !excludeTables.includes(table.table),
    );
    if (!filteredTables.length) return 0;

    // create a union query to find the count of the value in all tables
    const unionQueries = filteredTables.map(
      (table) => Prisma.sql`
        SELECT '${Prisma.raw(table.table)}' AS table, COUNT(id) AS count
        FROM ${Prisma.raw(table.table)}
        WHERE ${Prisma.raw(column)} = ${value}
    `,
    );
    const countSql = Prisma.sql`${Prisma.join(unionQueries, ' UNION ALL ')}`;
    const countResults = await client.$queryRaw<
      Array<{
        table: string;
        count: bigint;
      }>
    >(countSql);

    return countResults.reduce(
      (acc, result) => acc + +result.count.toString(),
      0,
    );
  }

  protected async _getClient(): Promise<PrismaClient> {
    const tenantId = RequestContextService.getTenantId() ?? '';

    let client = this.clients.get(tenantId);
    if (!client) {
      client = this.clientManager.getClient(tenantId);
      this.clients.set(tenantId, client);
    }

    return client;
  }
}
