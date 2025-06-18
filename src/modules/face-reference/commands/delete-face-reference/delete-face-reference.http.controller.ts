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
import { FaceReferenceNotFoundError } from '../../domain/reference.error';
import { DeleteFaceReferenceCommand } from './delete-face-reference.command';
import { DeleteFaceReferenceServiceResult } from './delete-face-reference.service';

@Controller(routesV1.version)
export class DeleteFaceReferenceHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(
    `${resourcesV1.FACE_REFERENCE.parent} - ${resourcesV1.FACE_REFERENCE.displayName}`,
  )
  @ApiOperation({ summary: 'Delete a Face reference' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'FaceReference ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'FaceReference deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FaceReferenceNotFoundError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FACE_REFERENCE.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.tacVu.faceReference.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') faceReferenceId: bigint): Promise<void> {
    const command = new DeleteFaceReferenceCommand({ faceReferenceId });
    const result: DeleteFaceReferenceServiceResult =
      await this.commandBus.execute(command);

    match(result, {
      Ok: (isOk: boolean) => isOk,
      Err: (error: Error) => {
        if (error instanceof FaceReferenceNotFoundError) {
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
