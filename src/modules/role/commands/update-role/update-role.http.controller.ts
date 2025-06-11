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
import { RoleMapper } from '../../mappers/role.mapper';
import { RoleResponseDto } from '../../dtos/role.response.dto';
import {
  RoleAlreadyExistsError,
  RoleAlreadyInUseError,
  RoleNotFoundError,
} from '../../domain/role.error';
import { UpdateRoleRequestDto } from './update-role.request.dto';
import { UpdateRoleCommand } from './update-role.command';
import { UpdateRoleServiceResult } from './update-role.service';
import { RoleEntity } from '../../domain/role.entity';

@Controller(routesV1.version)
export class UpdateRoleHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: RoleMapper,
  ) {}

  @ApiTags(`${resourcesV1.ROLE.parent} - ${resourcesV1.ROLE.displayName}`)
  @ApiOperation({ summary: 'Update a Role' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ROLE ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: RoleNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.ROLE.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.role.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') roleId: bigint,
    @Body() body: UpdateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    const command = new UpdateRoleCommand({
      roleId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateRoleServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (Role: RoleEntity) => this.mapper.toResponse(Role),
      Err: (error: Error) => {
        if (error instanceof RoleNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof RoleAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof RoleAlreadyInUseError) {
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
