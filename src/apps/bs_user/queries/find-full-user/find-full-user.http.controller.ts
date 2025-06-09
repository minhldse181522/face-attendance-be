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
import { BsUserPaginatedResponseDto } from '../../dtos/bs-user.paginated.response.dto';
import { BsUserMapper } from '../../mappers/bs-user.mapper';
import { FindFullUserInforQuery } from './find-full-user.query-handler';
import { FindFullUserInforRequestDto } from './find-full-user.request.dto';

@Controller(routesV1.version)
export class FindFullUserInforHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: BsUserMapper,
  ) {}
  @ApiTags(`${resourcesV1.BS_USER.parent} - ${resourcesV1.BS_USER.displayName}`)
  @ApiOperation({ summary: 'Lấy danh sách nhân sự đầy đủ thông tin' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: BsUserPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.BS_USER.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.businessLogic.user.fullUserInfor)
  async findFullUserInfor(
    @Query(new DirectFilterPipe<any, Prisma.WorkingScheduleWhereInput>([]))
    queryParams: FindFullUserInforRequestDto,
  ): Promise<BsUserPaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindFullUserInforQuery({
        ...queryParams.findOptions,
        role: queryParams.role,
        isActive: queryParams.isActive,
        branch: queryParams.branch,
        position: queryParams.position,
      }),
    );

    const paginated = result.unwrap();

    return new BsUserPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
