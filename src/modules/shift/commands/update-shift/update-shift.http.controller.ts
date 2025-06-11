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
import { ShiftEntity } from '../../domain/shift.entity';
import {
  ShiftAlreadyExistsError,
  ShiftAlreadyInUseError,
  ShiftNotFoundError,
} from '../../domain/shift.error';
import { ShiftResponseDto } from '../../dtos/shift.response.dto';
import { ShiftMapper } from '../../mappers/shift.mapper';
import { UpdateShiftCommand } from './update-shift.command';
import { UpdateShiftRequestDto } from './update-shift.request.dto';
import { UpdateShiftServiceResult } from './update-shift.service';

@Controller(routesV1.version)
export class UpdateShiftHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: ShiftMapper,
  ) {}

  @ApiTags(`${resourcesV1.SHIFT.parent} - ${resourcesV1.SHIFT.displayName}`)
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
    type: ShiftResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: ShiftNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.SHIFT.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.shift.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') shiftId: bigint,
    @Body() body: UpdateShiftRequestDto,
  ): Promise<ShiftResponseDto> {
    const command = new UpdateShiftCommand({
      shiftId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateShiftServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (shift: ShiftEntity) => this.mapper.toResponse(shift),
      Err: (error: Error) => {
        if (error instanceof ShiftNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof ShiftAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof ShiftAlreadyInUseError) {
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
