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
import { TimeKeepingNotFoundError } from '../../domain/time-keeping.error';
import { DeleteTimeKeepingCommand } from './delete-time-keeping.command';
import { DeleteTimeKeepingServiceResult } from './delete-time-keeping.service';

@Controller(routesV1.version)
export class DeleteTimeKeepingHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(
    `${resourcesV1.TIME_KEEPING.parent} - ${resourcesV1.TIME_KEEPING.displayName}`,
  )
  @ApiOperation({ summary: 'Delete a Time Keeping' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'TimeKeeping ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'TimeKeeping deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: TimeKeepingNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.TIME_KEEPING.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.timeKeeping.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') timeKeepingId: bigint): Promise<void> {
    const command = new DeleteTimeKeepingCommand({ timeKeepingId });
    const result: DeleteTimeKeepingServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof TimeKeepingNotFoundError) {
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
