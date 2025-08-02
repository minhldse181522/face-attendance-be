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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import { UserContractEntity } from '../../domain/user-contract.entity';
import {
  UserContractAlreadyExistsError,
  UserContractAlreadyInUseError,
  UserContractNotFoundError,
} from '../../domain/user-contract.error';
import { UserContractResponseDto } from '../../dtos/user-contract.response.dto';
import { UserContractMapper } from '../../mappers/user-contract.mapper';
import { UpdateUserContractCommand } from './update-user-contract.command';
import { UpdateUserContractRequestDto } from './update-user-contract.request.dto';
import { UpdateUserContractServiceResult } from './update-user-contract.service';

@Controller(routesV1.version)
export class UpdateUserContractHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: UserContractMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.USER_CONTRACT.parent} - ${resourcesV1.USER_CONTRACT.displayName}`,
  )
  @ApiOperation({ summary: 'Update a User Contract' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User Contract ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserContractResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserContractNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.USER_CONTRACT.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.userContract.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') userContractId: bigint,
    @Body() body: UpdateUserContractRequestDto,
  ): Promise<UserContractResponseDto> {
    const command = new UpdateUserContractCommand({
      userContractId,
      ...body,
      startTime: body.startTime ? new Date(body.startTime) : null,
      endTime: body.endTime ? new Date(body.endTime) : null,
      updatedBy: user.userName,
    });

    const result: UpdateUserContractServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (userContract: UserContractEntity) =>
        this.mapper.toResponse(userContract),
      Err: (error: Error) => {
        if (error instanceof UserContractNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof UserContractAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof UserContractAlreadyInUseError) {
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
