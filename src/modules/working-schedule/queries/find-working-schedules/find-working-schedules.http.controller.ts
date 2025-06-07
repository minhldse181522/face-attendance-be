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
import { WorkingSchedulePaginatedResponseDto } from '../../dtos/working-schedule.paginated.response.dto';
import { WorkingScheduleMapper } from '../../mappers/working-schedule.mapper';
import { FindWorkingScheduleRequestDto } from './find-working-schedules.request.dto';
import { FindWorkingScheduleQuery } from './find-wroking-schedules.query-handler';

@Controller(routesV1.version)
export class FindWorkingScheduleHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: WorkingScheduleMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.WORKING_SCHEDULE.parent} - ${resourcesV1.WORKING_SCHEDULE.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách hợp đồng người dùng' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: WorkingSchedulePaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.WORKING_SCHEDULE.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.workingSchedule.root)
  async findWorkingSchedule(
    @Query(new DirectFilterPipe<any, Prisma.WorkingScheduleWhereInput>([]))
    queryParams: FindWorkingScheduleRequestDto,
  ): Promise<WorkingSchedulePaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindWorkingScheduleQuery(queryParams.findOptions),
    );

    const paginated = result.unwrap();

    return new WorkingSchedulePaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
