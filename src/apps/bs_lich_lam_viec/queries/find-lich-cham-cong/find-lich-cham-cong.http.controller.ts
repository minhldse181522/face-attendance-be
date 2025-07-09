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
import { LichChamCongPaginatedResponseDto } from '../../dtos/lich-cham-cong.paginated.response.dto';
import { LichLamViecMapper } from '../../mappers/lich-lam-viec.mapper';
import { FindLichChamCongQuery } from './find-lich-cham-cong.query-handler';
import { FindLichChamCongRequestDto } from './find-lich-cham-cong.request.dto';

@Controller(routesV1.version)
export class FindLichChamCongHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: LichLamViecMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.BS_LICH_LAM_VIEC.parent} - ${resourcesV1.BS_LICH_LAM_VIEC.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách lịch chấm công của nhân viên' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: LichChamCongPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.BS_LICH_LAM_VIEC.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.businessLogic.lichLamViec.lichChamCong)
  async findLichChamCong(
    @Query(new DirectFilterPipe<any, Prisma.TimeKeepingWhereInput>([]))
    queryParams: FindLichChamCongRequestDto,
  ): Promise<LichChamCongPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindLichChamCongQuery({
        ...queryParams.findOptions,
        fromDate: queryParams.fromDate,
        toDate: queryParams.toDate,
        userCode: queryParams.userCode,
      }),
    );

    const paginated = result.unwrap();

    return new LichChamCongPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toLichLamViecResponse),
    });
  }
}
