import { ApiErrorResponse } from '@libs/api/api-error.response';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import {
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
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import {
  WorkingScheduleAlreadyExistsError,
  WorkingScheduleAlreadyInUseError,
  WorkingScheduleNotFoundError,
} from '../../domain/working-schedule.error';
import { WorkingScheduleResponseDto } from '../../dtos/working-schedule.response.dto';
import { WorkingScheduleMapper } from '../../mappers/working-schedule.mapper';
import { UpdateWorkingScheduleCommand } from './update-working-schedule.command';
import { UpdateWorkingScheduleRequestDto } from './update-working-schedule.request.dto';
import { UpdateWorkingScheduleServiceResult } from './update-working-schedule.service';

@Controller(routesV1.version)
export class UpdateWorkingScheduleHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: WorkingScheduleMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.WORKING_SCHEDULE.parent} - ${resourcesV1.WORKING_SCHEDULE.displayName}`,
  )
  @ApiOperation({ summary: 'Update a Working Schedule' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Working Schedule ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: WorkingScheduleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: WorkingScheduleNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.WORKING_SCHEDULE.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.workingSchedule.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') workingScheduleId: bigint,
    @Body() body: UpdateWorkingScheduleRequestDto,
  ): Promise<WorkingScheduleResponseDto> {
    const command = new UpdateWorkingScheduleCommand({
      workingScheduleId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateWorkingScheduleServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (WorkingSchedule: WorkingScheduleEntity) =>
        this.mapper.toResponse(WorkingSchedule),
      Err: (error: Error) => {
        if (error instanceof WorkingScheduleNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof WorkingScheduleAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof WorkingScheduleAlreadyInUseError) {
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
