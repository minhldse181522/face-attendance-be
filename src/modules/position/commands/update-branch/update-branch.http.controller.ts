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
import { PositionEntity } from '../../domain/position.entity';
import {
  PositionAlreadyExistsError,
  PositionAlreadyInUseError,
  PositionNotFoundError,
} from '../../domain/position.error';
import { PositionResponseDto } from '../../dtos/position.response.dto';
import { PositionMapper } from '../../mappers/position.mapper';

import { UpdatePositionServiceResult } from './update-branch.service';
import { UpdatePositionRequestDto } from './update-branch.request.dto';
import { UpdatePositionCommand } from './update-branch.command';

@Controller(routesV1.version)
export class UpdatePositionHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: PositionMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.POSITION.parent} - ${resourcesV1.POSITION.displayName}`,
  )
  @ApiOperation({ summary: 'Update a Position' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Position ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PositionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: PositionNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.POSITION.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.position.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') positionId: bigint,
    @Body() body: UpdatePositionRequestDto,
  ): Promise<PositionResponseDto> {
    const command = new UpdatePositionCommand({
      positionId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdatePositionServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (Position: PositionEntity) => this.mapper.toResponse(Position),
      Err: (error: Error) => {
        if (error instanceof PositionNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof PositionAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof PositionAlreadyInUseError) {
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
