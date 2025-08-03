import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { ReqUser } from '@libs/decorators/request-user.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
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
import { ShiftNotFoundError } from '@src/modules/shift/domain/shift.error';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '@src/modules/working-schedule/domain/working-schedule.error';
import { WorkingScheduleResponseDto } from '@src/modules/working-schedule/dtos/working-schedule.response.dto';
import { WorkingScheduleMapper } from '@src/modules/working-schedule/mappers/working-schedule.mapper';
import { match } from 'oxide.ts';
import {
  ManagerNotAssignToUserError,
  NotGeneratedError,
  ShiftCreatedConflictError,
  UserContractDoesNotExistError,
  WorkingDateAlreadyExistError,
} from '../../domain/lich-lam-viec.error';
import { CreateLichLamViecCommand } from './tao-lich-lam-viec.command';
import { CreateLichLamViecRequestDto } from './tao-lich-lam-viec.request.dto';
import { CreateLichLamViecServiceResult } from './tao-lich-lam-viec.service';

@Controller(routesV1.version)
export class CreateLichLamViecHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: WorkingScheduleMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.BS_LICH_LAM_VIEC.parent} - ${resourcesV1.BS_LICH_LAM_VIEC.displayName}`,
  )
  @ApiOperation({ summary: 'Tạo lịch làm việc cho nhân viên' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: WorkingScheduleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.BS_LICH_LAM_VIEC.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.businessLogic.lichLamViec.lichLam)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateLichLamViecRequestDto,
  ): Promise<WorkingScheduleResponseDto[]> {
    const command = new CreateLichLamViecCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateLichLamViecServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (workingSchedule: WorkingScheduleEntity[]) =>
        workingSchedule.map((ws) => this.mapper.toResponse(ws)),
      Err: (error: Error) => {
        if (
          error instanceof ManagerNotAssignToUserError ||
          error instanceof UserContractDoesNotExistError ||
          error instanceof WorkingDateAlreadyExistError ||
          error instanceof NotGeneratedError ||
          error instanceof ShiftCreatedConflictError
        ) {
          throw new BadRequestException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (
          error instanceof WorkingScheduleNotFoundError ||
          error instanceof ShiftNotFoundError
        ) {
          throw new NotFoundException({
            message: error.message,
            errorCode: error.code,
          });
        }
        throw error;
      },
    });
  }
}
