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
import { UserContractEntity } from '../../domain/user-contract.entity';
import { UserContractAlreadyExistsError } from '../../domain/user-contract.error';
import { UserContractResponseDto } from '../../dtos/user-contract.response.dto';
import { UserContractMapper } from '../../mappers/user-contract.mapper';
import { CreateUserContractCommand } from './create-user-contract.command';
import { CreateUserContractRequestDto } from './create-user-contract.request.dto';
import { CreateUserContractServiceResult } from './create-user-contract.service';

@Controller(routesV1.version)
export class CreateUserContractHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: UserContractMapper,
  ) {}

  @ApiTags(`${resourcesV1.BS_USER.parent} - ${resourcesV1.BS_USER.displayName}`)
  @ApiOperation({ summary: 'Create a user contract' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserContractResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserContractAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.USER_CONTRACT.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.businessLogic.userContract.createContract)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateUserContractRequestDto,
  ): Promise<UserContractResponseDto> {
    const command = new CreateUserContractCommand({
      ...body,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      branchCodes: body.branchCodes, // Add the branch codes array
      createdBy: user.userName,
    });

    const result: CreateUserContractServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (userContract: UserContractEntity) =>
        this.mapper.toResponse(userContract),
      Err: (error: Error) => {
        if (error instanceof UserContractAlreadyExistsError) {
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
