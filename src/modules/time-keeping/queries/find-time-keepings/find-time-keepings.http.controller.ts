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
import { TimeKeepingPaginatedResponseDto } from '../../dtos/time-keeping.paginated.response.dto';
import { TimeKeepingMapper } from '../../mappers/time-keeping.mapper';
import { FindTimeKeepingQuery } from './find-time-keepings.query-handler';
import { FindTimeKeepingRequestDto } from './find-time-keepings.request.dto';

@Controller(routesV1.version)
export class FindTimeKeepingHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: TimeKeepingMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.TIME_KEEPING.parent} - ${resourcesV1.TIME_KEEPING.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách thời gian làm việc' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: TimeKeepingPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.TIME_KEEPING.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.timeKeeping.root)
  async findTimeKeeping(
    @Query(new DirectFilterPipe<any, Prisma.TimeKeepingWhereInput>([]))
    queryParams: FindTimeKeepingRequestDto,
  ): Promise<TimeKeepingPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindTimeKeepingQuery(queryParams.findOptions),
    );

    const paginated = result.unwrap();

    return new TimeKeepingPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
