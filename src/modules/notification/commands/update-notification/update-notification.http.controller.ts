import { ApiErrorResponse } from '@libs/api/api-error.response';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  NotFoundException as NotFoundHttpException,
  Param,
  ParseIntPipe,
  Put,
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
import { resourceScopes, resourcesV1 } from '@src/configs/app.permission';
import { routesV1 } from '@src/configs/app.routes';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { match } from 'oxide.ts';
import { NotificationEntity } from '../../domain/notification.entity';
import {
  NotificationAlreadyExistsError,
  NotificationAlreadyInUseError,
  NotificationNotFoundError,
} from '../../domain/notification.error';
import { NotificationResponseDto } from '../../dtos/notification.response.dto';
import { NotificationMapper } from '../../mappers/notification.mapper';
import { UpdateNotificationCommand } from './update-notification.command';
import { UpdateNotificationRequestDto } from './update-notification.request.dto';
import { UpdateNotificationServiceResult } from './update-notification.service';

@Controller(routesV1.version)
export class UpdateNotificationHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: NotificationMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.NOTIFICATION.parent} - ${resourcesV1.NOTIFICATION.displayName}`,
  )
  @ApiOperation({ summary: 'Update a Notification' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: NotificationNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.NOTIFICATION.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.notification.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id', ParseIntPipe) notificationId: number,
    @Body() body: UpdateNotificationRequestDto,
  ): Promise<NotificationResponseDto> {
    const command = new UpdateNotificationCommand({
      notificationId: BigInt(notificationId),
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateNotificationServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (Notification: NotificationEntity) =>
        this.mapper.toResponse(Notification),
      Err: (error: Error) => {
        if (error instanceof NotificationNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof NotificationAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof NotificationAlreadyInUseError) {
          throw new ConflictException({
            message: error.message,
            error: error.code,
          });
        }

        throw error;
      },
    });
  }
}
