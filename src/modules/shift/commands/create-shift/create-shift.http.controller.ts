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
import { ShiftEntity } from '../../domain/shift.entity';
import { ShiftAlreadyExistsError } from '../../domain/shift.error';
import { ShiftResponseDto } from '../../dtos/shift.response.dto';
import { ShiftMapper } from '../../mappers/shift.mapper';
import { CreateShiftCommand } from './create-shift.command';
import { CreateShiftRequestDto } from './create-shift.request.dto';
import { CreateShiftServiceResult } from './create-shift.service';

@Controller(routesV1.version)
export class CreateShiftHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: ShiftMapper,
  ) {}

  @ApiTags(`${resourcesV1.SHIFT.parent} - ${resourcesV1.SHIFT.displayName}`)
  @ApiOperation({ summary: 'Create a user contract' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ShiftResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: ShiftAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.SHIFT.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.shift.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateShiftRequestDto,
  ): Promise<ShiftResponseDto> {
    const command = new CreateShiftCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateShiftServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (shift: ShiftEntity) => this.mapper.toResponse(shift),
      Err: (error: Error) => {
        if (error instanceof ShiftAlreadyExistsError) {
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
