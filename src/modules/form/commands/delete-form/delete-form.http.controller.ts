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
import { FormNotFoundError } from '../../domain/form.error';
import { DeleteFormServiceResult } from './delete-form.service';
import { DeleteFormCommand } from './delete-form.command';

@Controller(routesV1.version)
export class DeleteFormHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(`${resourcesV1.FORM.parent} - ${resourcesV1.FORM.displayName}`)
  @ApiOperation({ summary: 'Xóa Đơn' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Form ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Đơn đã được xóa',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FormNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FORM.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.form.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') formId: bigint): Promise<void> {
    const command = new DeleteFormCommand({ formId });
    const result: DeleteFormServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof FormNotFoundError) {
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
