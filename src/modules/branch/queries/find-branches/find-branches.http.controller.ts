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
import { BranchPaginatedResponseDto } from '../../dtos/branch.paginated.response.dto';
import { BranchMapper } from '../../mappers/branch.mapper';
import { FindBranchQuery } from './find-branches.query-handler';
import { FindBranchRequestDto } from './find-branches.request.dto';

@Controller(routesV1.version)
export class FindBranchHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: BranchMapper,
  ) {}
  @ApiTags(`${resourcesV1.BRANCH.parent} - ${resourcesV1.BRANCH.displayName}`)
  @ApiOperation({ summary: 'Lấy danh sách chi nhánh' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: BranchPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.BRANCH.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.branch.root)
  async findBranch(
    @Query(new DirectFilterPipe<any, Prisma.BranchWhereInput>([]))
    queryParams: FindBranchRequestDto,
  ): Promise<BranchPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindBranchQuery(queryParams.findOptions),
    );

    const paginated = result.unwrap();

    return new BranchPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
