import {
  Paginated,
  PrismaPaginatedQueryParams,
  RepositoryPort,
} from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { FormDescriptionEntity } from '../domain/form-description.entity';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { PrismaQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Option } from 'oxide.ts';

// Định nghĩa interface cho repository của FormDescription
export interface FormDescriptionRepositoryPort
  extends RepositoryPort<FormDescriptionEntity> {
  // Phương thức lấy danh sách form description với phân trang và lọc
  findAllPaginatedQuickSearch(
    params: PrismaPaginatedQueryParams<Prisma.FormDescriptionWhereInput> & {
      fromDate?: string; // Lọc theo ngày bắt đầu
      toDate?: string; // Lọc theo ngày kết thúc
      formId?: string; // Lọc theo ID form
      quickSearch?: string | number | Date; // Từ khóa tìm kiếm nhanh
      user?: RequestUser; // Thông tin người dùng để phân quyền (đầy đủ)
    },
  ): Promise<Paginated<FormDescriptionEntity>>;
  findManyFormDescriptionByParams(
    params: PrismaQueryBase<Prisma.FormDescriptionWhereInput>,
  ): Promise<FormDescriptionEntity[]>;
  findFormDescriptionByParams(
    params: PrismaQueryBase<Prisma.FormDescriptionWhereInput>,
  ): Promise<Option<FormDescriptionEntity>>;
}
