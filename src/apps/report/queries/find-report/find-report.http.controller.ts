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
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { ReportResponseDto } from '../../dtos/report.response.dto';
import { match } from 'oxide.ts';
import {
  FindReportQuery,
  FindReportQueryResult,
} from './find-report.query-handler';
import { FindReportRequestDto } from './find-report.request.dto';

@Controller(routesV1.version)
export class FindReportHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiTags(
    `${resourcesV1.BS_REPORT.parent} - ${resourcesV1.BS_REPORT.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy báo cáo' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: ReportResponseDto,
  })
  @AuthPermission(resourcesV1.BS_REPORT.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.businessLogic.report.findReport)
  async findReport(
    @Query()
    queryParams: FindReportRequestDto,
  ): Promise<ReportResponseDto> {
    const query = new FindReportQuery(queryParams);
    const result: FindReportQueryResult = await this.queryBus.execute(query);

    return match(result, {
      Ok: (data: any) => {
        const reports = data.reports.map((item) => ({
          month: item.month,
          data: item.data,
        }));
        return new ReportResponseDto({ reports });
      },
      Err: (err) => {
        throw err;
      },
    });
  }
}
