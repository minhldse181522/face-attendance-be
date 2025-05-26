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

import { FindFormQuery, FindFormQueryResult } from './find-forms.query-handler';
import { FormMapper } from '../../mappers/form.mapper';
import { FormPaginatedResponseDto } from '../../dtos/form.paginated.response.dto';
import { FormScalarFieldEnum } from '../../database/form.repository.prisma';
import { FindFormRequestDto } from './find-forms.request.dto';

@Controller(routesV1.version)
export class FindFormHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: FormMapper,
  ) {}
  @ApiTags(`${resourcesV1.FORM.parent} - ${resourcesV1.FORM.displayName}`)
  @ApiOperation({ summary: 'Lấy danh sách Đơn' })
  @ApiBearerAuth()
  @ApiQuery({
    type: String || Number,
    required: false,
    description: 'Filter to apply',
    name: 'quickSearch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FormPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.FORM.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.form.root)
  async findForm(
    @Query(
      new DirectFilterPipe<any, Prisma.FormWhereInput>([
        FormScalarFieldEnum.title,
        FormScalarFieldEnum.description,
        FormScalarFieldEnum.roleCode,
      ]),
    )
    queryParams: FindFormRequestDto,
  ): Promise<FormPaginatedResponseDto> {
    const query = new FindFormQuery({
      ...queryParams.findOptions,
      quickSearch: queryParams.quickSearch,
    });
    const result: FindFormQueryResult = await this.queryBus.execute(query);
    const paginated = result.unwrap();

    return new FormPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
