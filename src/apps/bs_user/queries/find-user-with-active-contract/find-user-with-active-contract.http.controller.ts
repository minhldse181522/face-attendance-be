import { DirectFilterPipe } from '@chax-at/prisma-filter';
import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { routesV1 } from '@src/configs/app.routes';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { UserScalarFieldEnum } from '@src/modules/user/database/user.repository.prisma';
import { BsUserPaginatedResponseDto } from '../../dtos/bs-user.paginated.response.dto';
import { BsUserMapper } from '../../mappers/bs-user.mapper';
import { FindUserWithActiveContractQuery } from './find-user-with-active-contract.query-handler';
import { FindUserWithActiveContractRequestDto } from './find-user-with-active-contract.request.dto';

@Controller(routesV1.version)
export class FindUserWithActiveContractHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: BsUserMapper,
  ) {}
  @ApiTags(`${resourcesV1.BS_USER.parent} - ${resourcesV1.BS_USER.displayName}`)
  @ApiOperation({ summary: 'Lấy danh sách user với hợp đồng đang hoạt động' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: BsUserPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.BS_USER.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.businessLogic.user.root)
  async findUser(
    @Query(
      new DirectFilterPipe<any, Prisma.UserWhereInput>([
        UserScalarFieldEnum.userName,
      ]),
    )
    queryParams: FindUserWithActiveContractRequestDto,
  ): Promise<BsUserPaginatedResponseDto> {
    const query = new FindUserWithActiveContractQuery({
      ...queryParams.findOptions,
    });
    const result = await this.queryBus.execute(query);

    const paginated = result.unwrap();

    return new BsUserPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
