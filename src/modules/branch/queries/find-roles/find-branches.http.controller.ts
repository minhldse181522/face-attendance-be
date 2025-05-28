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
import { BranchScalarFieldEnum } from '../../database/branch.repository.prisma';
import { BranchPaginatedResponseDto } from '../../dtos/branch.paginated.response.dto';
import { BranchMapper } from '../../mappers/branch.mapper';
import {
  FindBranchsQuery,
  FindBranchsQueryResult,
} from './find-branches.query-handler';
import { FindBranchsRequestDto } from './find-branches.request.dto';

@Controller(routesV1.version)
export class FindBranchsHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: BranchMapper,
  ) {}

  @ApiTags(`${resourcesV1.BRANCH.parent} - ${resourcesV1.BRANCH.displayName}`)
  @ApiOperation({ summary: 'Get Branch với QuickSearch' })
  @ApiBearerAuth()
  @ApiQuery({
    type: String || Number,
    required: false,
    description: 'Filter to apply',
    name: 'quickSearch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BranchPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.BRANCH.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.branch.root)
  async findBranchs(
    @Query(
      new DirectFilterPipe<any, Prisma.BranchWhereInput>([
        BranchScalarFieldEnum.code,
        BranchScalarFieldEnum.branchName,
      ]),
    )
    queryParams: FindBranchsRequestDto,
  ): Promise<BranchPaginatedResponseDto> {
    const query = new FindBranchsQuery(queryParams);
    const result: FindBranchsQueryResult = await this.queryBus.execute(query);

    const paginated = result.unwrap();

    return new BranchPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
