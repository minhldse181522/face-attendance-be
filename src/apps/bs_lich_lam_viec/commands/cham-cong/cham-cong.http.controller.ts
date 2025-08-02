import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
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
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { WorkingScheduleResponseDto } from '@src/modules/working-schedule/dtos/working-schedule.response.dto';

import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { ShiftNotFoundError } from '@src/modules/shift/domain/shift.error';
import { WorkingScheduleNotFoundError } from '@src/modules/working-schedule/domain/working-schedule.error';
import { WorkingScheduleMapper } from '@src/modules/working-schedule/mappers/working-schedule.mapper';
import { match } from 'oxide.ts';
import {
  AlreadyCheckInError,
  ChamCongKhongDuDieuKienError,
  CheckInTimeNotInContractError,
  CheckInTooEarlyError,
  LateCheckInError,
} from '../../domain/lich-lam-viec.error';
import { ChamCongCommand } from './cham-cong.command';
import { ChamCongRequestDto } from './cham-cong.request.dto';
import { ChamCongServiceResult } from './cham-cong.service';

@Controller(routesV1.version)
export class ChamCongHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: WorkingScheduleMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.BS_LICH_LAM_VIEC.parent} - ${resourcesV1.BS_LICH_LAM_VIEC.displayName}`,
  )
  @ApiOperation({ summary: 'Chấm công' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'WorkingSchedule ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: WorkingScheduleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.BS_LICH_LAM_VIEC.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.businessLogic.lichLamViec.chamCong)
  async chamCong(
    @ReqUser() user: RequestUser,
    @Param('id') workingScheduleId: bigint,
    @Body() body: ChamCongRequestDto,
  ): Promise<WorkingScheduleResponseDto> {
    const command = new ChamCongCommand({
      workingScheduleId,
      ...body,
      updatedBy: user.userName,
    });

    const result: ChamCongServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (workingSchedule: WorkingScheduleEntity) =>
        this.mapper.toResponse(workingSchedule),
      Err: (error: Error) => {
        if (
          error instanceof ChamCongKhongDuDieuKienError ||
          error instanceof CheckInTimeNotInContractError ||
          error instanceof AlreadyCheckInError ||
          error instanceof LateCheckInError ||
          error instanceof CheckInTooEarlyError
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
