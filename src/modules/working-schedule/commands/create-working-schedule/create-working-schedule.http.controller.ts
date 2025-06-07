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
import { WorkingScheduleEntity } from '../../domain/working-schedule.entity';
import { WorkingScheduleAlreadyExistsError } from '../../domain/working-schedule.error';
import { WorkingScheduleResponseDto } from '../../dtos/working-schedule.response.dto';
import { CreateWorkingScheduleCommand } from './create-working-schedule.command';
import { CreateWorkingScheduleRequestDto } from './create-working-schedule.request.dto';
import { CreateWorkingScheduleServiceResult } from './create-working-schedule.service';
import { WorkingScheduleMapper } from '../../mappers/working-schedule.mapper';

@Controller(routesV1.version)
export class CreateWorkingScheduleHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: WorkingScheduleMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.WORKING_SCHEDULE.parent} - ${resourcesV1.WORKING_SCHEDULE.displayName}`,
  )
  @ApiOperation({ summary: 'Create a user contract' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: WorkingScheduleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: WorkingScheduleAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.WORKING_SCHEDULE.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.workingSchedule.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateWorkingScheduleRequestDto,
  ): Promise<WorkingScheduleResponseDto> {
    const command = new CreateWorkingScheduleCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateWorkingScheduleServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (workingSchedule: WorkingScheduleEntity) =>
        this.mapper.toResponse(workingSchedule),
      Err: (error: Error) => {
        if (error instanceof WorkingScheduleAlreadyExistsError) {
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
