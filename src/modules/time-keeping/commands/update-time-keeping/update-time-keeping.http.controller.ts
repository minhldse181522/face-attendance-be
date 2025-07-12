import { ApiErrorResponse } from '@libs/api/api-error.response';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  NotFoundException as NotFoundHttpException,
  Param,
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
import { TimeKeepingEntity } from '../../domain/time-keeping.entity';
import {
  CannotCheckOutBecauseNotWorkError,
  NotAllowToCheckout,
  NotAllowToCheckoutAfterMidNight,
  TimeKeepingAlreadyExistsError,
  TimeKeepingAlreadyInUseError,
  TimeKeepingNotFoundError,
} from '../../domain/time-keeping.error';
import { TimeKeepingResponseDto } from '../../dtos/time-keeping.response.dto';
import { TimeKeepingMapper } from '../../mappers/time-keeping.mapper';
import { UpdateTimeKeepingCommand } from './update-time-keeping.command';
import { UpdateTimeKeepingRequestDto } from './update-time-keeping.request.dto';
import { UpdateTimeKeepingServiceResult } from './update-time-keeping.service';

@Controller(routesV1.version)
export class UpdateTimeKeepingHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: TimeKeepingMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.TIME_KEEPING.parent} - ${resourcesV1.TIME_KEEPING.displayName}`,
  )
  @ApiOperation({ summary: 'Update a Time Keeping' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Time Keeping ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TimeKeepingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: TimeKeepingNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.TIME_KEEPING.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.timeKeeping.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') timeKeepingId: bigint,
    @Body() body: UpdateTimeKeepingRequestDto,
  ): Promise<TimeKeepingResponseDto> {
    const command = new UpdateTimeKeepingCommand({
      timeKeepingId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateTimeKeepingServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (TimeKeeping: TimeKeepingEntity) =>
        this.mapper.toResponse(TimeKeeping),
      Err: (error: Error) => {
        if (
          error instanceof NotAllowToCheckout ||
          error instanceof NotAllowToCheckoutAfterMidNight ||
          error instanceof CannotCheckOutBecauseNotWorkError
        ) {
          throw new BadRequestException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof TimeKeepingNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof TimeKeepingAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof TimeKeepingAlreadyInUseError) {
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
