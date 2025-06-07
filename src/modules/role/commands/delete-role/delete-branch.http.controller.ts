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
import { RoleNotFoundError } from '../../domain/role.error';
import { DeleteRoleServiceResult } from './delete-branch.service';
import { DeleteRoleCommand } from './delete-role.command';

@Controller(routesV1.version)
export class DeleteRoleHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(`${resourcesV1.ROLE.parent} - ${resourcesV1.ROLE.displayName}`)
  @ApiOperation({ summary: 'Delete a Role' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ROLE ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Role deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: RoleNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.ROLE.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.role.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') roleId: bigint): Promise<void> {
    const command = new DeleteRoleCommand({ roleId });
    const result: DeleteRoleServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof RoleNotFoundError) {
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
