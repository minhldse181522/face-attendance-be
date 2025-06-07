import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
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
import { ApiErrorResponse } from '@src/libs/api/api-error.response';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { FormDescriptionAlreadyExistsError } from '../../domain/form-description.error';
import { FormDescriptionResponseDto } from '../../dtos/form-description.response.dto';
import { FormDescriptionMapper } from '../../mappers/form-description.mapper';
import { CreateFormDescriptionCommand } from './create-form-description.command';
import { CreateFormDescriptionRequestDto } from './create-form-description.request.dto';
import { CreateFormDescriptionCommandResult } from './create-form-description.service';
import { match } from 'oxide.ts';
import { FormDescriptionEntity } from '../../domain/form-description.entity';

@Controller(routesV1.version)
export class CreateFormDescriptionHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: FormDescriptionMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.FORM_DESCRIPTION.parent} - ${resourcesV1.FORM_DESCRIPTION.displayName}`,
  )
  @ApiOperation({ summary: 'Tạo mới đơn' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Form description created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: FormDescriptionAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FORM_DESCRIPTION.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.formDescription.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateFormDescriptionRequestDto,
  ): Promise<FormDescriptionResponseDto> {
    const command = new CreateFormDescriptionCommand({
      ...body,
      status: body.status || 'PENDING',
      createdBy: user.userName,
      submittedBy: user.code,
      startTime: body.startTime,
      endTime: body.endTime,
      formId: body.formId,
    });
    const result: CreateFormDescriptionCommandResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (form: FormDescriptionEntity) => this.mapper.toResponse(form),
      Err: (error: Error) => {
        if (error instanceof FormDescriptionAlreadyExistsError) {
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
