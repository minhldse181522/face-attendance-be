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
import { UserBranchEntity } from '../../domain/user-branch.entity';
import {
  UserBranchAlreadyExistsError,
  UserBranchAlreadyInUseError,
  UserBranchNotFoundError,
} from '../../domain/user-branch.error';
import { UserBranchResponseDto } from '../../dtos/user-branch.response.dto';
import { UpdateUserBranchCommand } from './update-user-branch.command';
import { UpdateUserBranchRequestDto } from './update-user-branch.request.dto';
import { UpdateUserBranchServiceResult } from './update-user-branch.service';
import { UserBranchMapper } from '../../mappers/user-branch.mapper';

@Controller(routesV1.version)
export class UpdateUserBranchHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: UserBranchMapper,
  ) {}

  @ApiTags('User Branch')
  @ApiOperation({ summary: 'Update a User Branch assignment' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User Branch ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserBranchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserBranchNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.USER_BRANCH.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.userBranch.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') userBranchId: bigint,
    @Body() body: UpdateUserBranchRequestDto,
  ): Promise<UserBranchResponseDto> {
    const command = new UpdateUserBranchCommand({
      userBranchId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateUserBranchServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (userBranch: UserBranchEntity) => this.mapper.toResponse(userBranch),
      Err: (error: Error) => {
        if (error instanceof UserBranchNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof UserBranchAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof UserBranchAlreadyInUseError) {
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
