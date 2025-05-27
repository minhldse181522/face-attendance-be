import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import {
  FormDescription as FormDescriptionModel,
  Prisma,
} from '@prisma/client';
import { Paginated, PrismaPaginatedQueryParams } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { IField } from '@src/libs/utils';
import { FormDescriptionEntity } from '../domain/form-description.entity';
import { FormDescriptionMapper } from '../mappers/form-description.mapper';
import { FormDescriptionRepositoryPort } from './form-description.repository.port';

export const FormDescriptionScalarFieldEnum =
  Prisma.FormDescriptionScalarFieldEnum;

@Injectable()
export class PrismaFormDescriptionRepository
  extends PrismaMultiTenantRepositoryBase<
    FormDescriptionEntity,
    FormDescriptionModel
  >
  implements FormDescriptionRepositoryPort
{
  protected modelName = 'formDescription';

  constructor(
    private manager: PrismaClientManager,
    mapper: FormDescriptionMapper,
  ) {
    super(manager, mapper);
  }

  async findAllPaginatedQuickSearch(
    params: PrismaPaginatedQueryParams<Prisma.FormDescriptionWhereInput> & {
      fromDate?: string;
      toDate?: string;
      formId?: string;
      quickSearch?: string;
    },
  ): Promise<Paginated<FormDescriptionEntity>> {
    const searchableFields: IField[] = [
      { field: 'code', type: 'string' },
      { field: 'reason', type: 'string' },
      { field: 'status', type: 'string' },
      { field: 'submittedBy', type: 'string' },
    ];
    const searchableFieldsUser: IField[] = [
      { field: 'firstName', type: 'string' },
      { field: 'lastName', type: 'string' },
    ];
    const searchableFieldsForm: IField[] = [{ field: 'title', type: 'string' }];

    const { quickSearch, ...rest } = params;
    const data = this.findAllPaginatedWithQuickSearchFiter(
      rest,
      quickSearch
        ? {
            quickSearchString: quickSearch,
            searchableFields,
            searchableFieldsUser,
            searchableFieldsForm,
          }
        : undefined,
    );
    return data;
  }
  private async findAllPaginatedWithQuickSearchFiter(
    params: PrismaPaginatedQueryBase<Prisma.FormDescriptionWhereInput> & {
      fromDate?: string;
      toDate?: string;
      formId?: string;
    },
    quickSearch?: {
      quickSearchString: string | number;
      searchableFields: IField[];
      searchableFieldsUser: IField[];
      searchableFieldsForm?: IField[];
    },
  ): Promise<Paginated<FormDescriptionEntity>> {
    const client = await this._getClient();
    const {
      page,
      limit,
      offset,
      orderBy,
      where = {},
      fromDate,
      toDate,
      formId,
    } = params;

    //#region function createQuickSearchFilter

    let searchableFields: Prisma.FormDescriptionWhereInput =
      {} as Prisma.FormDescriptionWhereInput;
    let searchableFieldsUser: Prisma.UserWhereInput =
      {} as Prisma.UserWhereInput;
    let searchableFieldsForm: Prisma.FormWhereInput =
      {} as Prisma.FormWhereInput;

    if (quickSearch) {
      searchableFields =
        this.createQuickSearchFilter<Prisma.FormDescriptionWhereInput>(
          quickSearch.quickSearchString,
          quickSearch.searchableFields,
        );
      searchableFieldsUser =
        this.createQuickSearchFilter<Prisma.UserWhereInput>(
          quickSearch.quickSearchString,
          quickSearch.searchableFieldsUser,
        );
      searchableFieldsForm =
        this.createQuickSearchFilter<Prisma.FormWhereInput>(
          quickSearch.quickSearchString,
          quickSearch.searchableFieldsForm || [],
        );
    }
    if (fromDate || toDate) {
      searchableFields = {
        ...searchableFields,
        createdAt: {
          ...(fromDate && { gte: fromDate }),
          ...(toDate && { lte: toDate }),
        },
      };
    }

    if (formId) {
      searchableFields = {
        ...searchableFields,
        formId: Number(formId),
      };
    }

    //#endregion
    const [data, count] = await Promise.all([
      client.formDescription
        .findMany({
          where: {
            ...where,
            OR: [
              {
                ...(Object.keys(searchableFields).length > 0 && {
                  ...searchableFields,
                }),
              },
              {
                ...(Object.keys(searchableFieldsUser).length > 0 && {
                  submitter: {
                    ...searchableFieldsUser,
                  },
                }),
              },
              {
                ...(Object.keys(searchableFieldsForm).length > 0 && {
                  form: {
                    ...searchableFieldsForm,
                  },
                }),
              },
            ],
          },
          include: {
            form: true,
            submitter: {
              select: {
                firstName: true,
                lastName: true,
                code: true,
              },
            },
            approver: true,
          },
          orderBy,
          skip: offset,
          take: limit,
        })
        .catch(() => []), // Return empty array if query fails
      client.formDescription
        .count({
          where: {
            ...where,
            ...(Object.keys(searchableFields).length > 0 && {
              ...searchableFields,
            }),
            ...(Object.keys(searchableFieldsUser).length > 0 && {
              submitter: {
                ...searchableFieldsUser,
              },
            }),
            ...(Object.keys(searchableFieldsForm).length > 0 && {
              form: {
                ...searchableFieldsForm,
              },
            }),
          },
        })
        .catch(() => 0), // Trả về 0 nếu truy vấn đếm thất bại
    ]);

    // Chuyển đổi dữ liệu từ model sang entity
    const mappedResult =
      data && data.length > 0
        ? data.map((item) => {
            const entity = this.mapper.toDomain(item);

            return entity;
          })
        : []; // Trả về mảng rỗng nếu không có dữ liệu

    // Trả về kết quả đã phân trang
    return new Paginated({
      data: mappedResult, // Dữ liệu đã được ánh xạ
      count: count || 0, // Tổng số bản ghi (hoặc 0 nếu không có)
      limit, // Giới hạn số bản ghi trên mỗi trang
      page, // Trang hiện tại
    });
  }
}
