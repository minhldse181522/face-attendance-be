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
import { UserBranchEntity } from '../../domain/user-branch.entity';
import { UserBranchAlreadyExistsError } from '../../domain/user-branch.error';
import { UserBranchResponseDto } from '../../dtos/user-branch.response.dto';
import { UserBranchMapper } from '../../mappers/user-branch.mapper';
import { CreateUserBranchCommand } from './create-user-branch.command';
import { CreateUserBranchRequestDto } from './create-user-branch.request.dto';
import { CreateUserBranchServiceResult } from './create-user-branch.service';

@Controller(routesV1.version)
export class CreateUserBranchHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: UserBranchMapper,
  ) {}

  @ApiTags('User Branch')
  @ApiOperation({ summary: 'Create a user branch assignment' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserBranchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserBranchAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.USER_BRANCH.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.userBranch.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateUserBranchRequestDto,
  ): Promise<UserBranchResponseDto> {
    const command = new CreateUserBranchCommand({
      ...body,
      code: '',
      createdBy: user.userName,
    });

    const result: CreateUserBranchServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (userBranch: UserBranchEntity) => this.mapper.toResponse(userBranch),
      Err: (error: Error) => {
        if (error instanceof UserBranchAlreadyExistsError) {
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
