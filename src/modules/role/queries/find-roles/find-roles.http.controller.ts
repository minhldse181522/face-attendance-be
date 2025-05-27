import { DirectFilterPipe } from '@chax-at/prisma-filter';
import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { RolePaginatedResponseDto } from '../../dtos/role.paginated.response.dto';
import { RoleMapper } from '../../mappers/role.mapper';
import { FindRoleQuery } from './find-roles.query-handler';
import { FindRoleRequestDto } from './find-roles.request.dto';

@Controller(routesV1.version)
export class FindRoleHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: RoleMapper,
  ) {}
  @ApiTags(`${resourcesV1.ROLE.parent} - ${resourcesV1.ROLE.displayName}`)
  @ApiOperation({ summary: 'Lấy danh sách chi nhánh' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RolePaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.ROLE.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.role.root)
  async findRole(
    @Query(new DirectFilterPipe<any, Prisma.RoleWhereInput>([]))
    queryParams: FindRoleRequestDto,
  ): Promise<RolePaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindRoleQuery(queryParams.findOptions),
    );

    const paginated = result.unwrap();

    return new RolePaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
