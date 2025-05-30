import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException as NotFoundHttpException,
  Param,
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
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';

import { match } from 'oxide.ts';
import { UserContractNotFoundError } from '../../domain/user-contract.error';
import { DeleteUserContractServiceResult } from './delete-user-contract.service';
import { DeleteUserContractCommand } from './delete-user-contract.command';

@Controller(routesV1.version)
export class DeleteUserContractHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(
    `${resourcesV1.USER_CONTRACT.parent} - ${resourcesV1.USER_CONTRACT.displayName}`,
  )
  @ApiOperation({ summary: 'Delete a User Contract' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'USER_CONTRACT ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User Contract deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserContractNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.USER_CONTRACT.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.userContract.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') userContractId: bigint): Promise<void> {
    const command = new DeleteUserContractCommand({ userContractId });
    const result: DeleteUserContractServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof UserContractNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }

        throw error;
      },
    });
  }
}
