import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { match } from 'oxide.ts';
import { UserContractNotFoundError } from '../../domain/user-contract.error';
import { UserContractResponseDto } from '../../dtos/user-contract.response.dto';
import { UserContractMapper } from '../../mappers/user-contract.mapper';
import { FindUserContractByIdQuery } from './find-user-contract-by-id.query-handler';

@Controller(routesV1.version)
export class FindUserContractByIdHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: UserContractMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.USER_CONTRACT.parent} - ${resourcesV1.USER_CONTRACT.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy thông tin hợp đồng người dùng theo ID' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
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
  @AuthPermission(resourcesV1.USER_CONTRACT.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.userContract.detail)
  async findById(@Param('id') id: bigint): Promise<UserContractResponseDto> {
    const query = new FindUserContractByIdQuery(id);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (userContract) => this.mapper.toResponse(userContract as any),
      Err: (error) => {
        if (error instanceof UserContractNotFoundError) {
          throw new NotFoundException({
            message: error.message,
            errorCode: error.code,
          });
        }
        throw error;
      },
    });
  }
}
