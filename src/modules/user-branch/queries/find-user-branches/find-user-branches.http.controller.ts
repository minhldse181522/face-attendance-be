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
import { UserBranchScalarFieldEnum } from '../../database/user-branch.repository.prisma';
import { UserBranchPaginatedResponseDto } from '../../dtos/user-branch.paginated.response.dto';
import { UserBranchMapper } from '../../mappers/user-branch.mapper';
import {
  FindUserBranchesQuery,
  FindUserBranchesQueryResult,
} from './find-user-branches.query-handler';
import { FindUserBranchesRequestDto } from './find-user-branches.request.dto';

@Controller(routesV1.version)
export class FindUserBranchesHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: UserBranchMapper,
  ) {}

  @ApiTags('User Branch')
  @ApiOperation({ summary: 'Get User Branch with QuickSearch' })
  @ApiBearerAuth()
  @ApiQuery({
    type: String || Number,
    required: false,
    description: 'Filter to apply',
    name: 'quickSearch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserBranchPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.USER_BRANCH.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.userBranch.root)
  async findUserBranches(
    @Query(
      new DirectFilterPipe<any, Prisma.UserBranchWhereInput>([
        UserBranchScalarFieldEnum.code,
        UserBranchScalarFieldEnum.branchCode,
        UserBranchScalarFieldEnum.userContractCode,
      ]),
    )
    queryParams: FindUserBranchesRequestDto,
  ): Promise<UserBranchPaginatedResponseDto> {
    const query = new FindUserBranchesQuery(queryParams);
    const result: FindUserBranchesQueryResult =
      await this.queryBus.execute(query);

    const paginated = result.unwrap();

    return new UserBranchPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
