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
import { PositionNotFoundError } from '../../domain/position.error';
import { DeletePositionCommand } from './delete-position.command';
import { DeletePositionServiceResult } from './delete-position.service';

@Controller(routesV1.version)
export class DeletePositionHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(
    `${resourcesV1.POSITION.parent} - ${resourcesV1.POSITION.displayName}`,
  )
  @ApiOperation({ summary: 'Delete a Position' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Position ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Position deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: PositionNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.POSITION.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.position.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') positionId: bigint): Promise<void> {
    const command = new DeletePositionCommand({ positionId });
    const result: DeletePositionServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof PositionNotFoundError) {
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
