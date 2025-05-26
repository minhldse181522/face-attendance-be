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
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';

import {
  FindFormDescriptionQuery,
  FindFormDescriptionQueryResult,
} from './find-form-descriptions.query-handler';
import { FormDescriptionMapper } from '../../mappers/form-description.mapper';
import { FormDescriptionPaginatedResponseDto } from '../../dtos/form-description.paginated.response.dto';
import { FormDescriptionScalarFieldEnum } from '../../database/form-description.repository.prisma';
import { FindFormDescriptionRequestDto } from './find-form-descriptions.request.dto';

@Controller(routesV1.version)
export class FindFormDescriptionHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: FormDescriptionMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.FORM_DESCRIPTION.parent} - ${resourcesV1.FORM_DESCRIPTION.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách đơn đã gửi' })
  @ApiBearerAuth()
  @ApiQuery({
    type: String || Number,
    required: false,
    description: 'Filter to apply',
    name: 'quickSearch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FormDescriptionPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.FORM_DESCRIPTION.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.formDescription.root)
  async findFormDescription(
    @Query(
      new DirectFilterPipe<any, Prisma.FormDescriptionWhereInput>([
        FormDescriptionScalarFieldEnum.code,
        FormDescriptionScalarFieldEnum.reason,
        FormDescriptionScalarFieldEnum.status,
        FormDescriptionScalarFieldEnum.submittedBy,
      ]),
    )
    queryParams: FindFormDescriptionRequestDto,
  ): Promise<FormDescriptionPaginatedResponseDto> {
    const query = new FindFormDescriptionQuery({
      ...queryParams.findOptions,
      quickSearch: queryParams.quickSearch,
    });
    const result: FindFormDescriptionQueryResult =
      await this.queryBus.execute(query);
    const paginated = result.unwrap();

    return new FormDescriptionPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
