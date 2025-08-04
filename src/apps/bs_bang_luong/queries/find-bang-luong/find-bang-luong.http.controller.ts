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
import { PayrollScalarFieldEnum } from '@src/modules/payroll/database/payroll.repository.prisma';
import { BangLuongPaginatedResponseDto } from '../../dtos/bang-luong.paginated.response.dto';
import { BangLuongMapper } from '../../mappers/bang-luong.mapper';
import { FindBangLuongQuery } from './find-bang-luong.query-handler';
import { FindBangLuongRequestDto } from './find-bang-luong.request.dto';

@Controller(routesV1.version)
export class FindBangLuongHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: BangLuongMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.BS_BANG_LUONG.parent} - ${resourcesV1.BS_BANG_LUONG.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách bảng lương' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: BangLuongPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.BS_BANG_LUONG.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.businessLogic.lichLamViec.bangLuong)
  async findBangLuong(
    @Query(
      new DirectFilterPipe<any, Prisma.PayrollWhereInput>([
        PayrollScalarFieldEnum.status,
      ]),
    )
    queryParams: FindBangLuongRequestDto,
  ): Promise<BangLuongPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindBangLuongQuery({
        ...queryParams.findOptions,
        month: queryParams.month,
        userCode: queryParams.userCode,
      }),
    );

    const paginated = result.unwrap();

    return new BangLuongPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toBangLuongResponse),
    });
  }
}
