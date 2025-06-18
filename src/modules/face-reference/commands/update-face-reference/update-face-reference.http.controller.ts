import { ApiErrorResponse } from '@libs/api/api-error.response';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  NotFoundException as NotFoundHttpException,
  Param,
  Put,
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
import { resourceScopes, resourcesV1 } from '@src/configs/app.permission';
import { routesV1 } from '@src/configs/app.routes';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { match } from 'oxide.ts';
import { FaceReferenceEntity } from '../../domain/reference.entity';
import {
  FaceReferenceAlreadyExistsError,
  FaceReferenceAlreadyInUseError,
  FaceReferenceNotFoundError,
} from '../../domain/reference.error';
import { FaceReferenceResponseDto } from '../../dtos/reference.response.dto';
import { FaceReferenceMapper } from '../../mappers/reference.mapper';
import { UpdateFaceReferenceCommand } from './update-face-reference.command';
import { UpdateFaceReferenceRequestDto } from './update-face-reference.request.dto';
import { UpdateFaceReferenceServiceResult } from './update-face-reference.service';

@Controller(routesV1.version)
export class UpdateFaceReferenceHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: FaceReferenceMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.FACE_REFERENCE.parent} - ${resourcesV1.FACE_REFERENCE.displayName}`,
  )
  @ApiOperation({ summary: 'Update a Working Schedule' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Working Schedule ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FaceReferenceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FaceReferenceNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FACE_REFERENCE.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.faceReference.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') faceReferenceId: bigint,
    @Body() body: UpdateFaceReferenceRequestDto,
  ): Promise<FaceReferenceResponseDto> {
    const command = new UpdateFaceReferenceCommand({
      faceReferenceId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateFaceReferenceServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (FaceReference: FaceReferenceEntity) =>
        this.mapper.toResponse(FaceReference),
      Err: (error: Error) => {
        if (error instanceof FaceReferenceNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof FaceReferenceAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof FaceReferenceAlreadyInUseError) {
          throw new ConflictException({
            message: error.message,
            error: error.code,
          });
        }

        throw error;
      },
    });
  }
}
