import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { None, Option, Some } from 'oxide.ts';
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
import { builderPrismaCondition, IField } from '../utils';

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

    // Validate ID format - should be numeric
    const idStr = String(id);
    if (!idStr || !/^\d+$/.test(idStr)) {
      return None;
    }

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
  async findAllPaginatedWithQuickSearch<T>(
    params: PrismaPaginatedQueryParams<T> & {
      quickSearch?: {
        quickSearchString: string | number;
        searchableFields: IField[];
      };
    },
  ): Promise<Paginated<Aggregate>> {
    // Get client by context
    const client = await this._getClient();

    const { limit, offset, page, where = {}, orderBy, quickSearch } = params;
    let searchConditions: T = {} as T;

    if (quickSearch) {
      searchConditions = this.createQuickSearchFilter(
        quickSearch.quickSearchString,
        quickSearch.searchableFields,
      );
    }

    const [data, count] = await Promise.all([
      client[this.modelName].findMany({
        skip: offset,
        take: limit,
        where: {
          ...where,
          ...(searchConditions && {
            ...searchConditions,
          }),
        },
        orderBy,
      }),

      client[this.modelName].count({
        where: {
          ...where,
          ...(searchConditions && {
            ...searchConditions,
          }),
        },
      }),
    ]);

    return new Paginated({
      data: count > 0 ? data.map((item) => this.mapper.toDomain(item)) : [],
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

  protected async _getClient(): Promise<PrismaClient> {
    const tenantId = RequestContextService.getTenantId() ?? '';

    let client = this.clients.get(tenantId);
    if (!client) {
      client = this.clientManager.getClient(tenantId);
      this.clients.set(tenantId, client);
    }

    return client;
  }
  /**
   * Create a quick search filter for Prisma query
   * @param searchTerm The search term
   * @param fields The fields to search
   * @returns The quick search filter
   */
  protected createQuickSearchFilter<T = any>(
    searchTerm: string | number,
    fields: IField[],
  ): Prisma.Enumerable<any> {
    const or: any[] = [];
    fields.forEach((f) => {
      if (f.type === 'string' && typeof searchTerm === 'string') {
        or.push({
          [f.field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        });
      }
      if (f.type === 'number' && !isNaN(Number(searchTerm))) {
        or.push({
          [f.field]: {
            equals: Number(searchTerm),
          },
        });
      }
    });
    return or.length > 0 ? { OR: or } : {};
  }
}
