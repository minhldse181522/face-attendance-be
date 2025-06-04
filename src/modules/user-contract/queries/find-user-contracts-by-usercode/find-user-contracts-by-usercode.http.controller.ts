import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import {
  ConflictException,
  Controller,
  Get,
  HttpStatus,
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
import { Err } from 'oxide.ts';
import { UserContractNotFoundError } from '../../domain/user-contract.error';
import { UserContractMapper } from '../../mappers/user-contract.mapper';
import { FindUserContractsByUserCodeQuery } from './find-user-contracts-by-usercode.query-handler';

@Controller(routesV1.version)
export class FindUserContractsByUserCodeHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: UserContractMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.USER_CONTRACT.parent} - ${resourcesV1.USER_CONTRACT.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy thông tin hợp đồng theo mã người dùng' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userCode',
    required: true,
    type: String,
    example: 'USER001',
    description: 'Mã người dùng',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về thông tin hợp đồng hiện tại của người dùng',
  })
  @AuthPermission(resourcesV1.USER_CONTRACT.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.userContract.byUserCode)
  async findUserContractsByUserCode(@Param('userCode') userCode: string) {
    try {
      const result = await this.queryBus.execute(
        new FindUserContractsByUserCodeQuery(userCode),
      );

      const contract = result.unwrap();
      return this.mapper.toResponse(contract);
    } catch (error) {
      if (error instanceof ConflictException) {
        return Err(new UserContractNotFoundError());
      }
    }
  }
}
