import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';
import { GeneratedFindOptions } from '@chax-at/prisma-filter';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';

// Định nghĩa lớp query filter với các tham số tìm kiếm
export class FindFormDescriptionQueryFiter extends PrismaPaginatedQueryBase<Prisma.FormDescriptionWhereInput> {
  quickSearch?: string | number; // Từ khóa tìm kiếm nhanh
  formId?: string; // ID của form cần lọc
  fromDate?: string; // Ngày bắt đầu
  toDate?: string; // Ngày kết thúc
  user?: RequestUser; // Đối tượng người dùng hiện tại

  constructor(
    props: GeneratedFindOptions<Prisma.FormDescriptionWhereInput> & {
      quickSearch?: string | number;
      formId?: string;
      fromDate?: string;
      toDate?: string;
      user?: RequestUser;
    },
  ) {
    super(props);
    Object.assign(this, props);
  }
}

// Định nghĩa kiểu dữ liệu trả về của query
export type FindFormDescriptionQueryResult = Result<
  Paginated<FormDescriptionEntity>,
  void
>;

// Handler xử lý query filter
@QueryHandler(FindFormDescriptionQueryFiter)
export class FindFormDescriptionFiterQueryHandler {
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    protected readonly formDescriptionRepo: FormDescriptionRepositoryPort, // Inject repository
  ) {}

  // Thực thi query và trả về kết quả
  async execute(
    query: FindFormDescriptionQueryFiter,
  ): Promise<FindFormDescriptionQueryResult> {
    // Gọi repository để lấy dữ liệu đã phân trang và lọc
    const result = await this.formDescriptionRepo.findAllPaginatedQuickSearch({
      ...query, // Truyền tất cả thông tin từ query
      quickSearch: query.quickSearch, // Từ khóa tìm kiếm
      fromDate: query.fromDate, // Ngày bắt đầu
      toDate: query.toDate, // Ngày kết thúc
      formId: query.formId, // ID form
      user: query.user, // Thông tin người dùng để phân quyền
    });

    // Trả về kết quả đã được đóng gói
    return Ok(
      new Paginated({
        data: result.data, // Dữ liệu form description
        count: result.count, // Tổng số bản ghi
        limit: query.limit, // Số bản ghi trên mỗi trang
        page: query.page, // Trang hiện tại
      }),
    );
  }
}
