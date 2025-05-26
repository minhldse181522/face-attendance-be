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
import { FormEntity } from '../../domain/form.entity';
import { FormAlreadyExistsError } from '../../domain/form.error';
import { FormResponseDto } from '../../dtos/form.response.dto';
import { FormMapper } from '../../mappers/form.mapper';
import { CreateFormCommand } from './create-form.command';
import { CreateFormRequestDto } from './create-form.request.dto';
import { CreateFormServiceResult } from './create-form.service';

@Controller(routesV1.version)
export class CreateFormHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: FormMapper,
  ) {}

  @ApiTags(`${resourcesV1.FORM.parent} - ${resourcesV1.FORM.displayName}`)
  @ApiOperation({ summary: 'Tạo mới Đơn' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: FormResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: FormAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.FORM.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.form.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreateFormRequestDto,
  ): Promise<FormResponseDto> {
    const command = new CreateFormCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreateFormServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (form: FormEntity) => this.mapper.toResponse(form),
      Err: (error: Error) => {
        if (error instanceof FormAlreadyExistsError) {
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
