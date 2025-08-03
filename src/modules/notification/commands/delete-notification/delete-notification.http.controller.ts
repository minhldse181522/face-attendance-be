import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException as NotFoundHttpException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { match } from 'oxide.ts';
import { NotificationNotFoundError } from '../../domain/notification.error';
import { DeleteNotificationCommand } from './delete-notification.command';
import { DeleteNotificationServiceResult } from './delete-notification.service';

@Controller(routesV1.version)
export class DeleteNotificationHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(
    `${resourcesV1.NOTIFICATION.parent} - ${resourcesV1.NOTIFICATION.displayName}`,
  )
  @ApiOperation({ summary: 'Delete a Notification' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Notification deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: NotificationNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.NOTIFICATION.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.notification.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') notificationId: bigint): Promise<void> {
    const command = new DeleteNotificationCommand({ notificationId });
    const result: DeleteNotificationServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof NotificationNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }

        throw error;
      },
    });
  }
}
