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
import { UserPaginatedResponseDto } from '../../dtos/user.paginated.response.dto';
import { UserMapper } from '../../mappers/user.mapper';
import { FindUserQuery } from './find-user.query-handler';
import { FindUserRequestDto } from './find-user.request.dto';
import { UserScalarFieldEnum } from '../../database/user.repository.prisma';

@Controller(routesV1.version)
export class FindUserHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: UserMapper,
  ) {}
  @ApiTags(`${resourcesV1.USER.parent} - ${resourcesV1.USER.displayName}`)
  @ApiOperation({ summary: 'Lấy danh sách user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.USER.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.user.root)
  async findUser(
    @Query(
      new DirectFilterPipe<any, Prisma.UserWhereInput>([
        UserScalarFieldEnum.userName,
      ]),
    )
    queryParams: FindUserRequestDto,
  ): Promise<UserPaginatedResponseDto> {
    const query = new FindUserQuery({
      ...queryParams.findOptions,
      role: queryParams.role,
      isActive: queryParams.isActive,
    });
    const result = await this.queryBus.execute(query);

    const paginated = result.unwrap();

    return new UserPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
