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
import { match } from 'oxide.ts';
import { BranchEntity } from '../../domain/branch.entity';
import { BranchResponseDto } from '../../dtos/branch.response.dto';
import { BranchMapper } from '../../mappers/branch.mapper';
import { CreateBranchCommand } from './create-branch.command';
import { CreateBranchRequestDto } from './create-branch.request.dto';
import { CreateBranchServiceResult } from './create-branch.service';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { BranchAlreadyExistsError } from '../../domain/branch.error';

@Controller(routesV1.version)
export class CreateBranchHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: BranchMapper,
  ) {}

  @ApiTags(`${resourcesV1.BRANCH.parent} - ${resourcesV1.BRANCH.displayName}`)
  @ApiOperation({ summary: 'Create a branch' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: BranchAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.BRANCH.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.branch.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateBranchRequestDto,
  ): Promise<BranchResponseDto> {
    const command = new CreateBranchCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateBranchServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (branch: BranchEntity) => this.mapper.toResponse(branch),
      Err: (error: Error) => {
        if (error instanceof BranchAlreadyExistsError) {
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
