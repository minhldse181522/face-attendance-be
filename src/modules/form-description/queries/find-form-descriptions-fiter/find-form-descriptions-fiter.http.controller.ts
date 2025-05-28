import { DirectFilterPipe } from '@chax-at/prisma-filter';
import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';

import {
  FindFormDescriptionQueryFiter,
  FindFormDescriptionQueryResult,
} from './find-form-descriptions-fiter.query-handler';
import { FormDescriptionMapper } from '../../mappers/form-description.mapper';
import { FormDescriptionPaginatedResponseDto } from '../../dtos/form-description.paginated.response.dto';
import { FormDescriptionScalarFieldEnum } from '../../database/form-description.repository.prisma';
import { FindFormDescriptionFilterRequestDto } from './find-form-descriptions-fiter.request.dto';

@Controller(routesV1.version)
export class FindFormDescriptionFilterHttpController {
  constructor(
    private readonly queryBus: QueryBus, // Query bus từ CQRS module
    private readonly mapper: FormDescriptionMapper, // Mapper để chuyển đổi entity thành response DTO
  ) {}

  @ApiTags(
    `${resourcesV1.FORM_DESCRIPTION.parent} - ${resourcesV1.FORM_DESCRIPTION.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách đơn đã gửi và kèm fiter' }) // Mô tả API
  @ApiBearerAuth() // Yêu cầu xác thực bằng Bearer token
  @ApiQuery({
    type: String || Number,
    required: false,
    description: 'Filter to apply', // Mô tả tham số tìm kiếm
    name: 'quickSearch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FormDescriptionPaginatedResponseDto, // Kiểu dữ liệu trả về
  })
  @AuthPermission(resourcesV1.FORM_DESCRIPTION.name, resourceScopes.VIEW) // Yêu cầu quyền xem form description
  @UseGuards(JwtAuthGuard) // Sử dụng JWT guard để xác thực
  @Get(routesV1.formDescriptionFiter.root) // Định nghĩa đường dẫn API
  async findFormDescription(
    @ReqUser() user: RequestUser, // Lấy thông tin người dùng từ token
    @Query(
      new DirectFilterPipe<any, Prisma.FormDescriptionWhereInput>([
        FormDescriptionScalarFieldEnum.code,
        FormDescriptionScalarFieldEnum.reason,
        FormDescriptionScalarFieldEnum.status,
        FormDescriptionScalarFieldEnum.submittedBy,
      ]),
    )
    queryParams: FindFormDescriptionFilterRequestDto, // Tham số query từ request
  ): Promise<FormDescriptionPaginatedResponseDto> {
    // Tạo đối tượng query với thông tin từ request
    const query = new FindFormDescriptionQueryFiter({
      ...queryParams.findOptions, // Các tùy chọn tìm kiếm
      quickSearch: queryParams.quickSearch, // Từ khóa tìm kiếm
      fromDate: queryParams.fromDate, // Ngày bắt đầu
      toDate: queryParams.toDate, // Ngày kết thúc
      formId: queryParams.formId, // ID form
      user: user, // Truyền toàn bộ thông tin người dùng để phân quyền
    });

    // Thực thi query thông qua query bus
    const result: FindFormDescriptionQueryResult =
      await this.queryBus.execute(query);
    const paginated = result.unwrap(); // Lấy kết quả từ Result

    // Trả về response DTO với dữ liệu đã được chuyển đổi
    return new FormDescriptionPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse), // Chuyển đổi entities thành response DTOs
    });
  }
}
