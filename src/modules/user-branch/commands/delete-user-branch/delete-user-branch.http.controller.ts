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
import { UserBranchNotFoundError } from '../../domain/user-branch.error';
import { DeleteUserBranchCommand } from './delete-user-branch.command';
import { DeleteUserBranchServiceResult } from './delete-user-branch.service';

@Controller(routesV1.version)
export class DeleteUserBranchHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags('User Branch')
  @ApiOperation({ summary: 'Delete a user branch assignment' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User Branch ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User branch assignment deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserBranchNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.USER_BRANCH.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.userBranch.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') userBranchId: bigint): Promise<void> {
    const command = new DeleteUserBranchCommand({ userBranchId });
    const result: DeleteUserBranchServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof UserBranchNotFoundError) {
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
