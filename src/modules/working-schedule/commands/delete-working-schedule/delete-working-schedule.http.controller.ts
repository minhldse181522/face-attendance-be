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
import { WorkingScheduleNotFoundError } from '../../domain/working-schedule.error';
import { DeleteWorkingScheduleCommand } from './delete-working-schedule.command';
import { DeleteWorkingScheduleServiceResult } from './delete-working-schedule.service';

@Controller(routesV1.version)
export class DeleteWorkingScheduleHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(
    `${resourcesV1.WORKING_SCHEDULE.parent} - ${resourcesV1.WORKING_SCHEDULE.displayName}`,
  )
  @ApiOperation({ summary: 'Delete a Working Schedule' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'WORKING_SCHEDULE ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Working Schedule deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: WorkingScheduleNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.WORKING_SCHEDULE.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.workingSchedule.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') workingScheduleId: bigint): Promise<void> {
    const command = new DeleteWorkingScheduleCommand({ workingScheduleId });
    const result: DeleteWorkingScheduleServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof WorkingScheduleNotFoundError) {
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
