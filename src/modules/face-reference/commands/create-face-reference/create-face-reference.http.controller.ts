import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { ReqUser } from '@libs/decorators/request-user.decorator';
import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { match } from 'oxide.ts';
import { FaceReferenceAlreadyExistsError } from '../../domain/reference.error';

import { FaceReferenceResponseDto } from '../../dtos/reference.response.dto';
import { FaceReferenceMapper } from '../../mappers/reference.mapper';
import { CreateFaceReferenceCommand } from './create-face-reference.command';
import { CreateFaceReferenceRequestDto } from './create-face-reference.request.dto';
import { CreateFaceReferenceServiceResult } from './create-face-reference.service';
import { FaceReferenceEntity } from '../../domain/reference.entity';

@Controller(routesV1.version)
export class CreateFaceReferenceHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: FaceReferenceMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.FACE_REFERENCE.parent} - ${resourcesV1.FACE_REFERENCE.displayName}`,
  )
  @ApiOperation({ summary: 'Create a FaceReference' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: FaceReferenceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FaceReferenceAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FACE_REFERENCE.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.faceReference.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateFaceReferenceRequestDto,
  ): Promise<FaceReferenceResponseDto> {
    const command = new CreateFaceReferenceCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateFaceReferenceServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (faceReference: FaceReferenceEntity) =>
        this.mapper.toResponse(faceReference),
      Err: (error: Error) => {
        if (error instanceof FaceReferenceAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        throw error;
      },
    });
  }
}
