import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { match } from 'oxide.ts';
import { MarkAllReadCommand } from './mark-all-read.command';
import { MarkAllReadRequestDto } from './mark-all-read.request.dto';
import { MarkAllReadServiceResult } from './mark-all-read.service';

@Controller(routesV1.version)
export class MarkAllReadHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(
    `${resourcesV1.NOTIFICATION.parent} - ${resourcesV1.NOTIFICATION.displayName}`,
  )
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc theo userCode' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Số lượng thông báo đã được cập nhật',
    schema: {
      type: 'object',
      properties: {
        updatedCount: {
          type: 'number',
          example: 5,
          description: 'Số lượng thông báo đã được đánh dấu là đã đọc',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.NOTIFICATION.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.notification.markAllRead)
  async markAllRead(
    @ReqUser() user: RequestUser,
    @Body() body: MarkAllReadRequestDto,
  ): Promise<{ updatedCount: number }> {
    const command = new MarkAllReadCommand({
      userCode: body.userCode,
      updatedBy: user.userName,
    });

    const result: MarkAllReadServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (updatedCount: number) => ({ updatedCount }),
      Err: () => {
        throw new Error('Failed to mark all notifications as read');
      },
    });
  }
}
