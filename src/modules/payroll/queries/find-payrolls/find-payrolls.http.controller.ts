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
import { PayrollScalarFieldEnum } from '../../database/payroll.repository.prisma';
import { PayrollPaginatedResponseDto } from '../../dtos/payroll.paginated.response.dto';
import { PayrollMapper } from '../../mappers/payroll.mapper';
import {
  FindPayrollsQuery,
  FindPayrollsQueryResult,
} from './find-payrolls.query-handler';
import { FindPayrollsRequestDto } from './find-payrolls.request.dto';

@Controller(routesV1.version)
export class FindPayrollsHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: PayrollMapper,
  ) {}

  @ApiTags(`${resourcesV1.PAYROLL.parent} - ${resourcesV1.PAYROLL.displayName}`)
  @ApiOperation({ summary: 'Get Payroll với QuickSearch' })
  @ApiBearerAuth()
  @ApiQuery({
    type: String || Number,
    required: false,
    description: 'Filter to apply',
    name: 'quickSearch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PayrollPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.PAYROLL.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.payroll.root)
  async findPayrolls(
    @Query(
      new DirectFilterPipe<any, Prisma.PayrollWhereInput>([
        PayrollScalarFieldEnum.code,
        PayrollScalarFieldEnum.userCode,
        PayrollScalarFieldEnum.month,
      ]),
    )
    queryParams: FindPayrollsRequestDto,
  ): Promise<PayrollPaginatedResponseDto> {
    const query = new FindPayrollsQuery(queryParams);
    const result: FindPayrollsQueryResult = await this.queryBus.execute(query);

    const paginated = result.unwrap();

    return new PayrollPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
