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
import { ShiftNotFoundError } from '../../domain/shift.error';
import { DeleteShiftCommand } from './delete-shift.command';
import { DeleteShiftServiceResult } from './delete-shift.service';

@Controller(routesV1.version)
export class DeleteShiftHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(`${resourcesV1.SHIFT.parent} - ${resourcesV1.SHIFT.displayName}`)
  @ApiOperation({ summary: 'Delete a Working Schedule' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'SHIFT ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Shift deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: ShiftNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.SHIFT.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.shift.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') shiftId: bigint): Promise<void> {
    const command = new DeleteShiftCommand({ shiftId });
    const result: DeleteShiftServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof ShiftNotFoundError) {
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
