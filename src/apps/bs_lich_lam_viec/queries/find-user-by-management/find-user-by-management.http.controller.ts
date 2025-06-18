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
import { UserScalarFieldEnum } from '@src/modules/user/database/user.repository.prisma';
import { UserByManagementPaginatedResponseDto } from '../../dtos/bs-user.paginated.response.dto';
import { LichLamViecMapper } from '../../mappers/lich-lam-viec.mapper';
import { FindUserByManagementQuery } from './find-user-by-management.query-handler';
import { FindUserByManagementRequestDto } from './find-user-by-management.request.dto';

@Controller(routesV1.version)
export class FindUserByManagementHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: LichLamViecMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.BS_LICH_LAM_VIEC.parent} - ${resourcesV1.BS_LICH_LAM_VIEC.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách nhân viên được quản lý' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserByManagementPaginatedResponseDto,
  })
  @ApiQuery({
    type: String || Number,
    required: false,
    description: 'Filter to apply',
    name: 'quickSearch',
  })
  @AuthPermission(resourcesV1.BS_LICH_LAM_VIEC.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.businessLogic.lichLamViec.userByManagement)
  async findUserByManagement(
    @Query(
      new DirectFilterPipe<any, Prisma.UserWhereInput>([
        UserScalarFieldEnum.userName,
      ]),
    )
    queryParams: FindUserByManagementRequestDto,
  ): Promise<UserByManagementPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindUserByManagementQuery(queryParams),
    );

    const paginated = result.unwrap();

    return new UserByManagementPaginatedResponseDto({
      ...paginated,
      data: paginated.data,
    });
  }
}
