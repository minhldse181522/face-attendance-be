import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Put,
  UseGuards,
  NotFoundException as NotFoundHttpException,
  ConflictException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import { UserResponseDto } from '../../dtos/user.response.dto';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { routesV1 } from '@src/configs/app.routes';
import { UpdateUserRequestDto } from './update-user.request.dto';
import { UpdateUserCommand } from './update-user.command';
import { UserMapper } from '../../mappers/user.mapper';
import { resourceScopes, resourcesV1 } from '@src/configs/app.permission';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../domain/user.error';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { UpdateUserServiceResult } from './update-user.service';
import { UserEntity } from '../../domain/user.entity';
import { match } from 'oxide.ts';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';

@Controller(routesV1.version)
export class UpdateUserHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: UserMapper,
  ) {}

  @ApiTags(`${resourcesV1.USER.parent} - ${resourcesV1.USER.displayName}`)
  @ApiOperation({ summary: 'Update a user' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.USER.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.user.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') userId: bigint,
    @Body() body: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const command = new UpdateUserCommand({
      userId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateUserServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (user: UserEntity) => this.mapper.toResponse(user),
      Err: (error: Error) => {
        if (error instanceof UserNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof UserAlreadyExistsError) {
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
