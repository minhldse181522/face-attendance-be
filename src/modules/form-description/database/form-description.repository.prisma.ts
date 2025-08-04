import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import {
  FormDescription as FormDescriptionModel,
  Prisma,
} from '@prisma/client';
import { Paginated, PrismaPaginatedQueryParams } from '@src/libs/ddd';
import {
  PrismaPaginatedQueryBase,
  PrismaQueryBase,
} from '@src/libs/ddd/prisma-query.base';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { IField } from '@src/libs/utils';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { None, Option, Some } from 'oxide.ts';
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

  async findFormDescriptionByParams(
    params: PrismaQueryBase<Prisma.FormDescriptionWhereInput>,
  ): Promise<Option<FormDescriptionEntity>> {
    const client = await this._getClient();
    const { where = {}, orderBy } = params;
    const result = await client.formDescription.findFirst({
      where: { ...where },
      orderBy,
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  async existsByCode(code: string): Promise<boolean> {
    const client = await this._getClient();
    const result = await client.formDescription.findUnique({
      where: { code },
      select: { id: true },
    });

    return !!result;
  }

  async findAllPaginatedQuickSearch(
    params: PrismaPaginatedQueryParams<Prisma.FormDescriptionWhereInput> & {
      fromDate?: string;
      toDate?: string;
      formId?: string;
      quickSearch?: string;
      user?: RequestUser;
    },
  ): Promise<Paginated<FormDescriptionEntity>> {
    // Định nghĩa các trường có thể tìm kiếm trong FormDescription
    const searchableFields: IField[] = [
      { field: 'code', type: 'string' },
      { field: 'reason', type: 'string' },
      { field: 'status', type: 'string' },
      { field: 'submittedBy', type: 'string' },
    ];
    // Định nghĩa các trường có thể tìm kiếm trong User
    const searchableFieldsUser: IField[] = [
      { field: 'firstName', type: 'string' },
      { field: 'lastName', type: 'string' },
    ];
    // Định nghĩa các trường có thể tìm kiếm trong Form
    const searchableFieldsForm: IField[] = [{ field: 'title', type: 'string' }];

    const { orderBy, quickSearch, ...rest } = params;
    // Gọi hàm xử lý tìm kiếm chính - Force desc order for createdAt
    const data = this.findAllPaginatedWithQuickSearchFiter(
      {
        ...rest,
        orderBy: [{ createdAt: 'desc' }], // Always order by createdAt desc for latest first
      },
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
      user?: RequestUser;
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
      user,
    } = params;

    // Trích xuất thông tin người dùng
    const userRoleCode = user?.roleCode;
    const userCode = user?.code;

    // Xây dựng điều kiện tìm kiếm cơ bản (thời gian, formId)
    const baseConditions: Prisma.FormDescriptionWhereInput = {
      ...where,
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate && { gte: fromDate }), // Từ ngày
              ...(toDate && { lte: toDate }), // Đến ngày
            },
          }
        : {}),
      ...(formId ? { formId: Number(formId) } : {}), // Lọc theo ID form nếu có
    };

    // Xây dựng điều kiện tìm kiếm nhanh (từ khóa tìm kiếm)
    const searchConditions: Prisma.FormDescriptionWhereInput[] = [];
    if (quickSearch) {
      // Tìm trong các trường của FormDescription
      const formDescriptionSearchFields =
        this.createQuickSearchFilter<Prisma.FormDescriptionWhereInput>(
          quickSearch.quickSearchString,
          quickSearch.searchableFields,
        );

      if (Object.keys(formDescriptionSearchFields).length > 0) {
        searchConditions.push(formDescriptionSearchFields);
      }

      // Tìm trong các trường của User (người gửi đơn)
      const userSearchFields =
        this.createQuickSearchFilter<Prisma.UserWhereInput>(
          quickSearch.quickSearchString,
          quickSearch.searchableFieldsUser,
        );

      if (Object.keys(userSearchFields).length > 0) {
        searchConditions.push({
          submitter: { ...userSearchFields },
        });
      }

      // Tìm trong các trường của Form
      const formSearchFields =
        this.createQuickSearchFilter<Prisma.FormWhereInput>(
          quickSearch.quickSearchString,
          quickSearch.searchableFieldsForm || [],
        );

      if (Object.keys(formSearchFields).length > 0) {
        searchConditions.push({
          form: { ...formSearchFields },
        });
      }
    }

    // Khởi tạo điều kiện lọc dựa vào role và quyền truy cập
    let formRoleCondition: Prisma.FormDescriptionWhereInput = {};
    let roleBasedConditions: Prisma.FormDescriptionWhereInput = {};

    // Nếu có thông tin user và role, áp dụng lọc theo quyền
    if (userRoleCode && user) {
      // Xử lý quyền truy cập theo role của người dùng
      switch (userRoleCode) {
        // R1 (Admin) - Có thể xem tất cả form
        case 'R1':
          // Không cần thêm điều kiện lọc cho admin
          break;

        // R3 (Branch user) - Chỉ xem forms từ users cùng branch
        case 'R3':
          if (userCode) {
            // Lấy danh sách contracts hoạt động của user hiện tại
            const userContracts = await client.userContract.findMany({
              where: {
                userCode,
                status: 'ACTIVE', // Chỉ lấy hợp đồng đang hoạt động
              },
              select: {
                code: true, // Lấy userContractCode
                userBranches: {
                  select: {
                    branchCode: true,
                    branch: {
                      select: {
                        branchName: true,
                      },
                    },
                  },
                },
              },
            });

            // Lấy tất cả branchCodes và branchNames từ các userContracts hoạt động
            const branchCodes = userContracts.flatMap((contract) =>
              contract.userBranches.map((ub) => ub.branchCode),
            );

            // Hiển thị thông tin chi nhánh cho việc debug
            const branchNames = userContracts
              .flatMap((contract) =>
                contract.userBranches.map((ub) => ub.branch?.branchName),
              )
              .filter(Boolean);

            console.log(
              `User ${userCode} thuộc các chi nhánh: ${branchNames.join(', ')}`,
            );
            console.log(
              `Các userContractCode hoạt động: ${userContracts.map((c) => c.code).join(', ')}`,
            );

            // Loại bỏ các giá trị trùng lặp
            const uniqueBranchCodes = [...new Set(branchCodes)];

            // Nếu user có branch, chỉ xem được các đơn từ người dùng trong cùng branch
            if (uniqueBranchCodes.length > 0) {
              roleBasedConditions = {
                submitter: {
                  userContracts: {
                    some: {
                      status: 'ACTIVE', // Chỉ xét các hợp đồng đang hoạt động
                      userBranches: {
                        some: {
                          branchCode: {
                            in: uniqueBranchCodes,
                          },
                        },
                      },
                    },
                  },
                },
              };
            }
          }
          break;

        // R2 (Manager) - Chỉ xem forms từ users họ quản lý
        case 'R2':
          roleBasedConditions = {
            submitter: {
              userContracts: {
                some: {
                  status: 'ACTIVE', // Only consider active contracts
                  managedBy: user.userName, // Use managedBy from userContract
                },
              },
            },
          };
          break;

        // R4 (Staff) - Chỉ xem forms của chính mình
        case 'R4':
          if (userCode) {
            roleBasedConditions = {
              submittedBy: userCode, // Chỉ xem các đơn do chính mình gửi
            };
          }
          break;
      }

      // Xử lý quyền truy cập dựa theo form.roleCode
      if (formId) {
        try {
          // Lấy thông tin roleCode của form
          const form = await client.form.findUnique({
            where: { id: Number(formId) },
            select: { roleCode: true },
          });

          if (form) {
            // Định nghĩa ma trận phân quyền: role nào được xem form có roleCode nào
            const roleAccessMap = {
              R1: ['R1', 'R2', 'R3'], // Admin xem tất cả
              R3: ['R3', 'R2'], // Branch user chỉ xem R3, R2
              R2: ['R2'], // Manager chỉ xem R2
            };

            const allowedFormRoleCodes = roleAccessMap[userRoleCode] || [];

            // Kiểm tra quyền truy cập
            if (!allowedFormRoleCodes.includes(form.roleCode)) {
              // Nếu không có quyền xem, trả về kết quả rỗng
              return new Paginated({
                data: [],
                count: 0,
                limit,
                page,
              });
            }

            // Thêm điều kiện lọc theo roleCode của form
            formRoleCondition = {
              form: {
                roleCode: form.roleCode,
              },
            };
          }
        } catch (error) {
          console.error('Error fetching form role:', error);
        }
      } else {
        // Nếu không có formId cụ thể, lọc theo các forms mà user có quyền xem dựa trên role
        const roleAccessMap = {
          R1: ['R1', 'R2', 'R3'],
          R3: ['R3', 'R2'],
          R2: ['R2'],
        };

        const allowedFormRoleCodes = roleAccessMap[userRoleCode] || [];

        // Thêm điều kiện lọc các form theo roleCode được phép
        if (allowedFormRoleCodes.length > 0) {
          formRoleCondition = {
            form: {
              roleCode: {
                in: allowedFormRoleCodes,
              },
            },
          };
        }
      }
    }

    // Kết hợp tất cả điều kiện lọc để tạo điều kiện cuối cùng
    const finalWhereCondition: Prisma.FormDescriptionWhereInput = {
      ...baseConditions,
      ...formRoleCondition,
      ...roleBasedConditions,
      ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
    };

    // Thực thi song song hai truy vấn: lấy dữ liệu và đếm tổng số
    const [data, count] = await Promise.all([
      client.formDescription
        .findMany({
          where: finalWhereCondition,
          include: {
            form: true, // Lấy thông tin form
            submitter: {
              select: {
                firstName: true,
                lastName: true,
                code: true,
                userContracts: {
                  where: {
                    status: 'ACTIVE', // Only include active contracts
                  },
                  select: {
                    code: true,
                    managedBy: true, // Get managedBy from here
                    positionCode: true, // Get positionCode from here
                    userBranches: {
                      select: {
                        branchCode: true,
                      },
                    },
                  },
                },
              },
            }, // Lấy thông tin người gửi đơn
            approver: true, // Lấy thông tin người duyệt
          },
          orderBy: orderBy ?? [{ createdAt: 'desc' }],
          skip: offset, // Bỏ qua các bản ghi theo phân trang
          take: limit, // Giới hạn số lượng bản ghi trả về
        })
        .catch((error) => {
          // Xử lý lỗi khi truy vấn dữ liệu
          console.error('Error fetching form descriptions:', error);
          return [];
        }),

      client.formDescription
        .count({ where: finalWhereCondition }) // Đếm tổng số bản ghi phù hợp
        .catch((error) => {
          // Xử lý lỗi khi đếm số lượng bản ghi
          console.error('Error counting form descriptions:', error);
          return 0;
        }),
    ]);

    // Chuyển đổi dữ liệu từ model sang entity
    const mappedResult = data.map((item) => this.mapper.toDomain(item));

    // Trả về kết quả đã phân trang
    return new Paginated({
      data: mappedResult, // Dữ liệu đã được ánh xạ thành entities
      count, // Tổng số bản ghi thỏa điều kiện
      limit, // Số bản ghi trên mỗi trang
      page, // Trang hiện tại
    });
  }

  async findManyFormDescriptionByParams(
    params: PrismaQueryBase<Prisma.FormDescriptionWhereInput>,
  ): Promise<FormDescriptionEntity[]> {
    const client = await this._getClient();
    const { where = {}, orderBy } = params;
    const result = await client.formDescription.findMany({
      where: { ...where },
      orderBy,
    });
    return result.map((item) => this.mapper.toDomain(item));
  }
}
