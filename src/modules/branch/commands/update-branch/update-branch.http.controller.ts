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
import { BranchEntity } from '../../domain/branch.entity';
import {
  BranchAlreadyExistsError,
  BranchAlreadyInUseError,
  BranchNotFoundError,
} from '../../domain/branch.error';
import { BranchResponseDto } from '../../dtos/branch.response.dto';
import { BranchMapper } from '../../mappers/branch.mapper';
import { UpdateBranchCommand } from './update-branch.command';
import { UpdateBranchRequestDto } from './update-branch.request.dto';
import { UpdateBranchServiceResult } from './update-branch.service';

@Controller(routesV1.version)
export class UpdateBranchHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: BranchMapper,
  ) {}

  @ApiTags(`${resourcesV1.BRANCH.parent} - ${resourcesV1.BRANCH.displayName}`)
  @ApiOperation({ summary: 'Update a branch' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: BranchNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.BRANCH.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.branch.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') branchId: bigint,
    @Body() body: UpdateBranchRequestDto,
  ): Promise<BranchResponseDto> {
    const command = new UpdateBranchCommand({
      branchId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateBranchServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (branch: BranchEntity) => this.mapper.toResponse(branch),
      Err: (error: Error) => {
        if (error instanceof BranchNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof BranchAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof BranchAlreadyInUseError) {
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
