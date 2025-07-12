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
import { ShiftPaginatedResponseDto } from '../../dtos/shift.paginated.response.dto';
import { ShiftMapper } from '../../mappers/shift.mapper';
import { FindShiftQuery } from './find-shifts.query-handler';
import { FindShiftRequestDto } from './find-shifts.request.dto';

@Controller(routesV1.version)
export class FindShiftHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: ShiftMapper,
  ) {}
  @ApiTags(`${resourcesV1.SHIFT.parent} - ${resourcesV1.SHIFT.displayName}`)
  @ApiOperation({ summary: 'Lấy danh sách ca làm' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: ShiftPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.SHIFT.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.shift.root)
  async findShift(
    @Query(new DirectFilterPipe<any, Prisma.ShiftWhereInput>([]))
    queryParams: FindShiftRequestDto,
  ): Promise<ShiftPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindShiftQuery({
        ...queryParams.findOptions,
        status: queryParams.status,
      }),
    );

    const paginated = result.unwrap();

    return new ShiftPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
