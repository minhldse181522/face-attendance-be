import { resourcesV1 } from '@config/app.permission';
import { Body, Controller, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@src/configs/app.routes';
import { ApiErrorResponse } from '@src/libs/api/api-error.response';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { UserMapper } from '@src/modules/user/mappers/user.mapper';
import { match } from 'oxide.ts';
import { RegisterResponseDto } from '../../dtos/register.response.dto';
import { RegisterCommand } from './register.command';
import { RegisterRequestDto } from './register.request.dto';
import { RegisterServiceResult } from './register.service';
import { FieldValidationExceptionFilter } from '@src/libs/api/field-validation-exception.error';

@UseFilters(FieldValidationExceptionFilter)
@Controller(routesV1.version)
export class RegisterHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: UserMapper,
  ) {}

  @ApiTags(`${resourcesV1.AUTH.parent} - ${resourcesV1.AUTH.displayName}`)
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @Post(routesV1.auth.register)
  async register(
    @Body() body: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const command = new RegisterCommand({
      ...body,
      createdBy: 'system',
    });

    const result: RegisterServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (data: UserEntity) => this.mapper.toResponse(data),
      Err: (error: Error) => {
        throw error;
      },
    });
  }
}
