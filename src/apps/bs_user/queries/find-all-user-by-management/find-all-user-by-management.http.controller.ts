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
import { BsUserPaginatedResponseDto } from '../../dtos/bs-user.paginated.response.dto';
import { BsUserMapper } from '../../mappers/bs-user.mapper';
import { FindAllUserByManagementQuery } from './find-all-user-by-management.query-handler';
import { FindAllUserByManagementRequestDto } from './find-all-user-by-management.request.dto';

@Controller(routesV1.version)
export class FindAllUserByManagementHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: BsUserMapper,
  ) {}
  @ApiTags(`${resourcesV1.BS_USER.parent} - ${resourcesV1.BS_USER.displayName}`)
  @ApiOperation({ summary: 'Lấy danh sách nhân sự đầy đủ thông tin' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: BsUserPaginatedResponseDto,
  })
  @ApiQuery({
    type: String,
    required: false,
    description: 'Quick search term for filtering users',
    name: 'quickSearch',
  })
  @AuthPermission(resourcesV1.BS_USER.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.businessLogic.user.allUserByManagement)
  async findAllUserByManagement(
    @Query(new DirectFilterPipe<any, Prisma.WorkingScheduleWhereInput>([]))
    queryParams: FindAllUserByManagementRequestDto,
  ): Promise<BsUserPaginatedResponseDto> {
    console.log('Controller received quickSearch:', queryParams.quickSearch);

    const result = await this.queryBus.execute(
      new FindAllUserByManagementQuery({
        ...queryParams.findOptions,
        quickSearch: queryParams.quickSearch,
        userCode: queryParams.userCode,
        isActive: queryParams.isActive,
        branch: queryParams.branch,
        position: queryParams.position,
      }),
    );

    const paginated = result.unwrap();

    return new BsUserPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
