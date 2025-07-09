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
import { TimeKeepingEntity } from '../../domain/time-keeping.entity';
import { TimeKeepingAlreadyExistsError } from '../../domain/time-keeping.error';
import { TimeKeepingResponseDto } from '../../dtos/time-keeping.response.dto';
import { TimeKeepingMapper } from '../../mappers/time-keeping.mapper';
import { CreateTimeKeepingCommand } from './create-time-keeping.command';
import { CreateTimeKeepingRequestDto } from './create-time-keeping.request.dto';
import { CreateTimeKeepingServiceResult } from './create-time-keeping.service';

@Controller(routesV1.version)
export class CreateTimeKeepingHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: TimeKeepingMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.TIME_KEEPING.parent} - ${resourcesV1.TIME_KEEPING.displayName}`,
  )
  @ApiOperation({ summary: 'Create a time keeping' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TimeKeepingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: TimeKeepingAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.TIME_KEEPING.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.timeKeeping.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateTimeKeepingRequestDto,
  ): Promise<TimeKeepingResponseDto> {
    const command = new CreateTimeKeepingCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateTimeKeepingServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (TimeKeeping: TimeKeepingEntity) =>
        this.mapper.toResponse(TimeKeeping),
      Err: (error: Error) => {
        if (error instanceof TimeKeepingAlreadyExistsError) {
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
