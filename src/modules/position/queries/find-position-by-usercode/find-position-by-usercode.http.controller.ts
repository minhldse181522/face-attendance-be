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
import { PositionPaginatedResponseDto } from '../../dtos/position.paginated.response.dto';
import { PositionMapper } from '../../mappers/position.mapper';
import { FindPositionByUsercodeQuery } from './find-position-by-usercode.query-handler';
import { FindPositionRequestDto } from './find-position-by-usercode.request.dto';

@Controller(routesV1.version)
export class FindPositionByUsercodeHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: PositionMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.POSITION.parent} - ${resourcesV1.POSITION.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách vị trí theo user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: PositionPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.POSITION.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.position.user)
  async findPositionByUsercode(
    @Query(new DirectFilterPipe<any, Prisma.PositionWhereInput>([]))
    queryParams: FindPositionRequestDto,
  ): Promise<PositionPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindPositionByUsercodeQuery({
        ...queryParams.findOptions,
        userCode: queryParams.userCode,
      }),
    );

    const paginated = result.unwrap();

    return new PositionPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
