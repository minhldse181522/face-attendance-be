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
import { PositionEntity } from '../../domain/position.entity';
import { PositionAlreadyExistsError } from '../../domain/position.error';
import { PositionResponseDto } from '../../dtos/position.response.dto';
import { PositionMapper } from '../../mappers/position.mapper';
import { CreatePositionCommand } from './create-position.command';
import { CreatePositionRequestDto } from './create-position.request.dto';
import { CreatePositionServiceResult } from './create-position.service';

@Controller(routesV1.version)
export class CreatePositionHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: PositionMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.POSITION.parent} - ${resourcesV1.POSITION.displayName}`,
  )
  @ApiOperation({ summary: 'Create a Position' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: PositionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: PositionAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.POSITION.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.position.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreatePositionRequestDto,
  ): Promise<PositionResponseDto> {
    const command = new CreatePositionCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreatePositionServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (position: PositionEntity) => this.mapper.toResponse(position),
      Err: (error: Error) => {
        if (error instanceof PositionAlreadyExistsError) {
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
