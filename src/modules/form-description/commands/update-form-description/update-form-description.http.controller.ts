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
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import {
  FormDescriptionAlreadyExistsError,
  FormDescriptionNotFoundError,
  FormDescriptionUpdateNotAllowedError,
  UserContractToEndNotFoundError,
  UserToUpdateFaceNotFoundError,
} from '../../domain/form-description.error';
import { FormDescriptionResponseDto } from '../../dtos/form-description.response.dto';
import { FormDescriptionMapper } from '../../mappers/form-description.mapper';
import { UpdateFormDescriptionCommand } from './update-form-description.command';
import { UpdateFormDescriptionRequestDto } from './update-form-description.request.dto';
import { UpdateFormDescriptionServiceResult } from './update-form-description.service';

@Controller(routesV1.version)
export class UpdateFormDescriptionHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: FormDescriptionMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.FORM_DESCRIPTION.parent} - ${resourcesV1.FORM_DESCRIPTION.displayName}`,
  )
  @ApiOperation({ summary: 'Cập nhật đơn đã gửi' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Form Description ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FormDescriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FormDescriptionNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FORM_DESCRIPTION.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.formDescription.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') formDescriptionId: bigint,
    @Body() body: UpdateFormDescriptionRequestDto,
  ): Promise<FormDescriptionResponseDto> {
    const command = new UpdateFormDescriptionCommand({
      formDescriptionId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateFormDescriptionServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (formDescription: FormDescriptionEntity) =>
        this.mapper.toResponse(formDescription),
      Err: (error: Error) => {
        if (
          error instanceof FormDescriptionNotFoundError ||
          error instanceof UserToUpdateFaceNotFoundError ||
          error instanceof UserContractToEndNotFoundError
        ) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof FormDescriptionAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof FormDescriptionUpdateNotAllowedError) {
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
