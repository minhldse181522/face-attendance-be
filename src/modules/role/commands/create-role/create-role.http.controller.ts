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
import { RoleEntity } from '../../domain/role.entity';
import { RoleAlreadyExistsError } from '../../domain/role.error';
import { RoleResponseDto } from '../../dtos/role.response.dto';
import { RoleMapper } from '../../mappers/branch.mapper';
import { CreateRoleCommand } from './create-role.command';
import { CreateRoleRequestDto } from './create-role.request.dto';
import { CreateRoleServiceResult } from './create-role.service';

@Controller(routesV1.version)
export class CreateRoleHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: RoleMapper,
  ) {}

  @ApiTags(`${resourcesV1.ROLE.parent} - ${resourcesV1.ROLE.displayName}`)
  @ApiOperation({ summary: 'Create a role' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: RoleAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.ROLE.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.role.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    const command = new CreateRoleCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateRoleServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (role: RoleEntity) => this.mapper.toResponse(role),
      Err: (error: Error) => {
        if (error instanceof RoleAlreadyExistsError) {
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
