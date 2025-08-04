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
import { NotificationScalarFieldEnum } from '../../database/notification.repository.prisma';
import { NotificationPaginatedResponseDto } from '../../dtos/notification.paginated.response.dto';
import { NotificationMapper } from '../../mappers/notification.mapper';
import {
  FindNotificationsQuery,
  FindNotificationsQueryResult,
} from './find-notifications.query-handler';
import { FindNotificationsRequestDto } from './find-notifications.request.dto';

@Controller(routesV1.version)
export class FindNotificationsHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: NotificationMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.NOTIFICATION.parent} - ${resourcesV1.NOTIFICATION.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy list thông báo với QuickSearch' })
  @ApiBearerAuth()
  @ApiQuery({
    type: String || Number,
    required: false,
    description: 'Filter to apply',
    name: 'quickSearch',
  })
  @ApiQuery({
    type: String,
    required: false,
    description: 'Mã người dùng',
    name: 'userCode',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: NotificationPaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.NOTIFICATION.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.notification.root)
  async findNotifications(
    @Query(
      new DirectFilterPipe<any, Prisma.NotificationWhereInput>([
        NotificationScalarFieldEnum.title,
        NotificationScalarFieldEnum.message,
        NotificationScalarFieldEnum.type,
        NotificationScalarFieldEnum.isRead,
      ]),
    )
    queryParams: FindNotificationsRequestDto,
  ): Promise<NotificationPaginatedResponseDto> {
    const query = new FindNotificationsQuery(queryParams);
    const result: FindNotificationsQueryResult =
      await this.queryBus.execute(query);

    const paginated = result.unwrap();

    return new NotificationPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
