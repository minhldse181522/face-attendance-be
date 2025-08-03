import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { ReqUser } from '@libs/decorators/request-user.decorator';
import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { match } from 'oxide.ts';
import { NotificationEntity } from '../../domain/notification.entity';
import { NotificationAlreadyExistsError } from '../../domain/notification.error';
import { NotificationResponseDto } from '../../dtos/notification.response.dto';
import { NotificationMapper } from '../../mappers/notification.mapper';
import { CreateNotificationCommand } from './create-notification.command';
import { CreateNotificationRequestDto } from './create-notification.request.dto';
import { CreateNotificationServiceResult } from './create-notification.service';

@Controller(routesV1.version)
export class CreateNotificationHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: NotificationMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.NOTIFICATION.parent} - ${resourcesV1.NOTIFICATION.displayName}`,
  )
  @ApiOperation({ summary: 'Create a Notification' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: NotificationAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.NOTIFICATION.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.notification.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateNotificationRequestDto,
  ): Promise<NotificationResponseDto> {
    const command = new CreateNotificationCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateNotificationServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (Notification: NotificationEntity) =>
        this.mapper.toResponse(Notification),
      Err: (error: Error) => {
        if (error instanceof NotificationAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        throw error;
      },
    });
  }
}
