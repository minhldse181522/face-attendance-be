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
import { UserContractPaginatedResponseDto } from '../../dtos/user-contract.paginated.response.dto';
import { UserContractMapper } from '../../mappers/user-contract.mapper';
import { FindUserContractQuery } from './find-user-contracts.query-handler';
import { FindUserContractRequestDto } from './find-user-contracts.request.dto';

@Controller(routesV1.version)
export class FindUserContractHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: UserContractMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.USER_CONTRACT.parent} - ${resourcesV1.USER_CONTRACT.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách hợp đồng người dùng' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserContractPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.USER_CONTRACT.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.userContract.root)
  async findUserContract(
    @Query(new DirectFilterPipe<any, Prisma.UserContractWhereInput>([]))
    queryParams: FindUserContractRequestDto,
  ): Promise<UserContractPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindUserContractQuery(queryParams.findOptions),
    );

    const paginated = result.unwrap();

    return new UserContractPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
