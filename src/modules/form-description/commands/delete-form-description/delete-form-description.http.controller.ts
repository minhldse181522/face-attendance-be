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
import { FormDescriptionNotFoundError } from '../../domain/form-description.error';
import { DeleteFormDescriptionServiceResult } from './delete-form-description.service';
import { DeleteFormDescriptionCommand } from './delete-form-description.command';

@Controller(routesV1.version)
export class DeleteFormDescriptionHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(
    `${resourcesV1.FORM_DESCRIPTION.parent} - ${resourcesV1.FORM_DESCRIPTION.displayName}`,
  )
  @ApiOperation({ summary: 'Xóa đơn đã gửi' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Form Description ID',
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
    description: FormDescriptionNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FORM_DESCRIPTION.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.formDescription.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') formDescriptionId: bigint): Promise<void> {
    const command = new DeleteFormDescriptionCommand({ formDescriptionId });
    const result: DeleteFormDescriptionServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof FormDescriptionNotFoundError) {
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
