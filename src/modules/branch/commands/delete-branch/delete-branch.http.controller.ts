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
import { BranchNotFoundError } from '../../domain/branch.error';
import { DeleteBranchCommand } from './delete-branch.command';
import { DeleteBranchServiceResult } from './delete-branch.service';

@Controller(routesV1.version)
export class DeleteBranchHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(`${resourcesV1.BRANCH.parent} - ${resourcesV1.BRANCH.displayName}`)
  @ApiOperation({ summary: 'Delete a branch' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'BRANCH ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'branch deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: BranchNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.BRANCH.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.branch.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') branchId: bigint): Promise<void> {
    const command = new DeleteBranchCommand({ branchId });
    const result: DeleteBranchServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof BranchNotFoundError) {
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
