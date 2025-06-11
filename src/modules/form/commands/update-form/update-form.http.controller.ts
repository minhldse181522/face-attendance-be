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
import { FormMapper } from '../../mappers/form.mapper';
import { FormResponseDto } from '../../dtos/form.response.dto';
import {
  FormAlreadyExistsError,
  FormAlreadyInUseError,
  FormNotFoundError,
} from '../../domain/form.error';
import { UpdateFormRequestDto } from './update-form.request.dto';
import { UpdateFormCommand } from './update-form.command';
import { UpdateFormServiceResult } from './update-form.service';
import { FormEntity } from '../../domain/form.entity';

@Controller(routesV1.version)
export class UpdateFormHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: FormMapper,
  ) {}

  @ApiTags(`${resourcesV1.FORM.parent} - ${resourcesV1.FORM.displayName}`)
  @ApiOperation({ summary: 'Cập nhật Đơn' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Form ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FormResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FormNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FORM.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.form.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') formId: bigint,
    @Body() body: UpdateFormRequestDto,
  ): Promise<FormResponseDto> {
    const command = new UpdateFormCommand({
      formId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdateFormServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (form: FormEntity) => this.mapper.toResponse(form),
      Err: (error: Error) => {
        if (error instanceof FormNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof FormAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof FormAlreadyInUseError) {
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
